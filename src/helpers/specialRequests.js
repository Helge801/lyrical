import axios from 'axios';
import { tabs } from '../core/pixel-finder';

export function getResponseBodyForURL(url, callback) {
    axios.get(url)
    .then(res => {
        callback(res.data);
    })
    .catch((err) => {
        console.log(err);
    })
}

export function makeRequest(requestObject,tabId,cb){
    const { url } = requestObject;
    requestObject.method = requestObject.method || 'get';
    const hasHeaders = requestObject.headers ? true : false;
    if(tabs[tabId]){
      const match = tabs[tabId].externalRequests.filter(v => {return v.url === url && v.hasHeaders === hasHeaders})[0];
      if(match) {
        cb(match.res);
        return;
      }
    }
    
    function update(res){
      const r = tabs[tabId].externalRequests;
      for(var i in r){
        if(r[i].url === requestObject.url && r[i].hasHeaders === hasHeaders){
          r[i].res = res;
          break;
        }
      }
      tabs[tabId].externalRequests = r;
      cb(res);
    }
  
    tabs[tabId].externalRequests.push({ url, res: 'pending', hasHeaders });
    axios.request(requestObject).then(update).catch((e) => {update(e.toString());});
  
  }