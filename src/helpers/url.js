export function parseQueryString(query) {
  if(query.charAt(0) === '?') {
    query = query.substring(1);
  }

  let map = {};

  for(const part of query.split('&')) {
    const kv = part.split('=');

    if(kv.length === 2) {
      const key = decodeURIComponent(kv[0]);
      const value = decodeURIComponent(kv[1]);

      if(key in map) {
        if(Array.isArray(map[key])) {
          map[key].push(value);
        } else {
          map[key] = [map[key], value];
        }
      } else {
        map[key] = value;
      }
    }
  }

  return map;
}

export function parseURL(url) {
  const u = new URL(url);
  let type;
  const m = u.pathname.match(/\/(\w+)/)
  if(m){
    type = m[0].substring(1);
  } else {
    type = url.match(/\/\/(\w+\.\w+)/)[1]
  }
  const params = parseQueryString(u.search);

  let campaign;
  const campaignType = u.pathname.match(/\/\w+\/(\d+)/);

  if(campaignType && campaignType.length > 0) {
    campaign = campaignType[1];
  }

  return {
    type: type,
    campaign: campaign,
    params: params,
    url: u
  };
}

export function extractParameters(activity){
  const { type, campaign, params, url } = parseURL(activity.url);
  const { host, pathname } = url;
  return Object.assign(activity, { type, campaign, params, host, pathname });
}

function replacer(name, val){
  if(typeof val === 'string') return val.replace(/\"/g, "\\\"");
  if(val && typeof val === 'object' && Object.keys(val).length === 0) {
    console.log(name, val)
    return null;
  }
  return val;
}

export function prepHarForExport(har, urlFilters){
  console.log(har)
  console.log(urlFilters)
  if(har && har.entries && har.entries.length > 0){
    har.entries = har.entries.filter(entry => {
      for(var i in urlFilters){
        if(entry.request.url.match(urlFilters[i])) return entry;
      }
    });
    if(har.entries.length > 0) return JSON.stringify({log: har},replacer,2);
  }
}
