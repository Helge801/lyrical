import { safeMatch } from './adProcessor';
import { getProducer } from '../core/pixel-finder';

export function processCookies(request){

  function parseCookie(cookie){
    const name = safeMatch(cookie,/^([^=]+)/,1);
    return {
      name,
      value: safeMatch(cookie, /=([^;]+)/,1),
      domain: safeMatch(cookie, /Domain=([^;]+)/,1),
      expires: safeMatch(cookie, /Expires=([^;]+)/,1),
      path: safeMatch(cookie, /Path=([^;]+)/,1),
      key: `${Date.now().toString()}${name}`,
    }
  }

  function mergeCookiesWithProducer( attempts = 5){
    const producer = getProducer(request.tabId);
    const value = producer.value;
    if(!value) return setTimeout(mergeCookiesWithProducer,200,attempts -1 )
    const oldCookies = value.cookieEvents.current.cookies;
    const cookies = oldCookies.concat(newCookies);
    value.cookieEvents.current.cookies = cookies;
    producer.next(value);
  }

  if(request.tabId < 1) return;
  const headers = request.responseHeaders;
  const newCookies = [];
  for(var i in headers)
    if(headers[i].name === 'Set-Cookie')
      newCookies.push(parseCookie(headers[i].value));
  if(newCookies.length > 0) mergeCookiesWithProducer();

}