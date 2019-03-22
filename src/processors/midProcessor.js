import browser from 'webextension-polyfill';
import { mergeWithProducer } from '../core/pixel-finder';
import { makeRequest } from '../helpers/specialRequests';
import { requiresAuthMsg } from '../components/tags/tagGroup'

export function processMID(activity,callback = mergeWithProducer) {
  const { tabId } = activity;
  
  function getMapping(mid, cb) {
    browser.cookies.getAll({ url: 'https://a.rakutenmarketing.com' })
      .then(cookies => {
        var auth;
        cookies.map(c => { if (c.name = "DPORT") auth = `user ${c.value}` });
        makeRequest({
          url: `https://api.mediaforge.com/v1/campaigns/${mid}`,
          method: 'get',
          withCredentials: true,
          headers: { Authorization: auth }
        }, tabId, r => {
          if(typeof r === 'string'){
            if(r.match(/code\s401/)) {
              requiresAuthMsg(true);
              return cb('unauthorized');
            } 
          } else {
            requiresAuthMsg(false);
            return cb(r.data);
          }
        });
      });
  }

  function getFeed(map, cb) {
    browser.cookies.getAll({ url: map.feedURLs.personal })
      .then(cookies => {
        makeRequest({
          url: map.feedURLs.personal,
          method: 'get',
          headers: {
            Cookies: cookies
          }
        },tabId,r => {
          if(typeof r === 'string') cb();
          else cb(r.data);
        })
      });
  }

  function getItemLookup(map, cb) {
    makeRequest({url: map.feedURLs.lookup}, tabId, r => {
      if(typeof r === 'string') cb();
      else cb(r.data);
    })
  }

  function getStatus(map, cb) {
    const domain = map.region === 'jp' ? 'jp-http://ads.rd.linksynergy.com' : 'http://ads.rd.linksynergy.com';
    const url = `${domain}/products/json/${map.normalized_name}/status`;
    makeRequest({ url }, tabId, r => {
      if(typeof r === 'string') cb();
      else cb(r.data);
    });
  }

  function loadMapping({ mid, pageType, pID, tabId}) {
    var mapping = { mappingType: pageType === "prod" ? "lookup" : "fullFeed", mappingStatus: 'failed', tabId, pID, pageType };
    if (!mid) return merge(mapping);
    getMapping(mid, m => {
      
      if (!m) return merge(mapping);
      if (m === 'unauthorized') return merge(Object.assign(mapping, { mappingStatus: 'unauthorized' }));
      mapping.mappingStatus = 'mappingOnly';
      mapping = Object.assign(mapping, m);
      const domain = mapping.region === 'jp' ? 'jp-http://ads.rd.linksynergy.com' : 'http://ads.rd.linksynergy.com';
      mapping.feedURLs = {
        personal: `${domain}/products/json/${mapping.normalized_name}/personal`,
        default: `${domain}/products/json/${mapping.normalized_name}/default`,
        lookup: `${domain}/products/json/${mapping.normalized_name}/lookup?pID=${mapping.pID}`,
        status: `${domain}/products/json/${mapping.normalized_name}/status`
      };
      const fallback = (f) => {
        if (!(f && f[0])) return merge(mapping);
        mapping.feed = f;
        mapping.mappingStatus = 'itemMissing';
        getStatus(mapping, s=>{
          if (s && s[0]) mapping.feedStatus = s[0];
          merge(mapping);
        })
      };

      const cb = (f) => {
        if (!(f && f[0])) {
          if (mapping.mappingType === 'lookup') getFeed(mapping,fallback);
          else return merge(mapping);
        }
        mapping.feed = f;
        mapping.mappingStatus = 'success';
        getStatus(mapping, s => {
          if (s && s[0]) mapping.feedStatus = s[0];
          merge(mapping);
        });
      };
      if (pageType === 'prod') getItemLookup(mapping, cb);
      else getFeed(mapping, cb);
    });
  }

  function extractMID(){
    activity.params = activity.params || {};
    if(activity.campaign || activity.mid) {
      loadMapping({
        mid: activity.campaign || activity.mid,
        pageType: activity.params.pt,
        pID: activity.params.prodID,
        tabId: activity.tabId
      });
    }
  }

  function merge(mapping){
    callback(mapping.tabId,{clientMapping: mapping});
  }

  extractMID();

}