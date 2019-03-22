import { processMID } from './midProcessor';
import { mergeWithProducer, tabs } from '../core/pixel-finder';
import { makeRequest } from '../helpers/specialRequests';
import { extractParameters } from '../helpers/url';

// Entry Point
export function handleAdRequest(activity, callBack) {
    const { url, tabId } = activity;

    const mid = safeMatch(url, /merchant=[a-zA-Z]{3,}(\d{3,})/, 1) ||
                safeMatch(url, /mID=(\d+)/, 1) ||
                safeMatch(url, /merchantID=(\d+)/, 1) ||
                safeMatch(url, /merchant%3D[a-zA-Z]{3,}(\d{3,})/, 1)

    if(mid){
        tabs[tabId].ads = tabs[tabId].ads || {};
        const ads = tabs[tabId].ads || {};
        for( var k in ads){ if(k === mid) return; }
        tabs[tabId].ads[mid] = "processing";
        processMID({mid, tabId},(id, mapping) => {
            tabs[tabId].ads[mid] = mapping.clientMapping;
            mergeWithProducer(tabId,{ads: tabs[tabId].ads})
        });
    }
    return;

}

export function findBestAdMatchIndex(ads, ad) {
    for(var i in ads){
        if(ads[i].mid == ad.mid) return i;
    }
}    

export function simplifyAds(ads){
    return ads.map(ad => {
        return cleanObject({
            client: ad.client,
            rias: ad.rias,
            mid: ad.mid,
            eventIDs: ad.eventIDs,
            impressionIDs: ad.impressionIDs,
            strategies: ad.strategies,
            urls: ad.urls,
            types: ad.types,
            tabId: ad.tabId,
            iframeIDs: ad.iframeIDs,
            np_campaign_ids: ad.np_campaign_ids,
            np_ad_ids: ad.np_ad_ids,
            append_querystrings: ad.append_querystrings,
            feeds: ad.feeds,
            sampleFeed: checkSampleFeed(ad.sampleFeed),
            mappingL: ad.mapping,
            clientMapping: ad.clientMapping,    
        });
    });
}

export function safeMatch(str, regex, index, modFunc) {
    if (typeof str !== 'string') return undefined;
    const res = str.match(regex);
    if (res && res.length > (index || 1) - 1) {
        var sub = index ? res[index] : res;
        if (modFunc) return modFunc(sub);
        return sub;
    }
    return undefined;
}

export function combineAds(a, b) {
    if(!(a && b)) return a || b;
    return cleanObject({
        client: a.client || b.client,
        rias: combineArray(a.rais, b.rias),
        riaIDs: combineArray(a.riaIDs, b.riaIDs),
        mid: a.mid || b.mid,
        eventIDs: combineArray(a.eventIDs, b.eventIDs),
        impressionIDs: combineArray(a.impressionIDs, b.impressionIDs),
        redirecctRID: a.redirecctRID || b.redirecctRID,
        strategies: combineArray(a.strategies, b.strategies),
        urls: combineArray(a.urls, b.urls),
        types: combineArray(a.types, b.types),
        tabId: a.tabId || b.tabId,
        iframeIDs: combineArray(a.iframeIDs, b.iframeIDs),
        np_campaign_ids: combineArray(a.np_campaign_ids , b.np_campaign_ids),
        np_ad_ids: combineArray(a.np_ad_ids, b.np_ad_ids),
        append_querystrings: combineArray(a.append_querystrings, b.append_querystrings),
        requestURLs: combineArray(a.requestURLs, b.requestURLs),
        feeds: combineArray(a.feeds, b.feeds, i => {return i.name}),
        sampleFeed: a.sampleFeed || b.sampleFeed,
        sampleFeedRquested: checkSampleFeed(a.sampleFeedRquested) || checkSampleFeed(b.sampleFeedRquested),
        matchedOn: combineArray(a.matchedOn, b.matchedOn),
        clientMapping: a.clientMapping || b.clientMapping,
    });
}

export function handleImpressions(activity, tabId){
    const type = activity.url.match(/\/\/.+\/(imp|eng|act)/)[1]
    const adEvents = tabs[tabId].adEvents;

    if(activity.statusCode){
      adEvents[type] = adEvents[type].map((req => {
        if(req.request.requestId == activity.requestId) req.response = activity;
        return req;
      }));
    } else {
      activity = extractParameters(activity);
      adEvents[type].push({request: activity, response: {}});
    }

    tabs[tabId].adEvents = adEvents;
    mergeWithProducer(tabId,{adEvents: adEvents})
}