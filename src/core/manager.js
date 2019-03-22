import React from 'react';
import ReactDOM from 'react-dom';
import browser from 'webextension-polyfill';
import { BehaviorSubject, Observable } from 'rxjs';
import Popup from '../components/root/popup-content';

import axios from 'axios';

// Background state
export const tabs = {};
const producers = {};
const settings = {
  local_setting_1: null,
  synced_setting_2: null
}
export const tabReloader = new BehaviorSubject({
  "1": null,
  "2": null,
  "3": null,
  "4": null,
  "5": null
});
export const reloader = new BehaviorSubject({tab: "1"});
export const lyricState = {
  "tab": "1",
  "1": "",
  "2": "",
  "3": "",
  "4": "",
  "5": ""
}

export default function manager(urlFilters) {



  //  Handlers

  function handleRequests(networkRequest) {
    if (networkRequest.url.match(/lyrics\/\w+\/\w+\.html$/)) {
      axios.get(networkRequest.url + "?")
        .then(res => {
          setBadge("!",networkRequest.tabId);
          var parser = new DOMParser;
          var lyrics = parser.parseFromString(safeMatch(res.data, /azlyrics\.com\scontent.+?>([\s\S]*?)<\/div/, 1),'text/html').body.textContent;
          lyrics = lyrics.replace(/<.*?>/g, "");
          mergeWithProducer(networkRequest.tabId, { lyrics });
        })
        .catch();
    }
  }

  // Browser Activities

  function getInitialProducer(tabId) {
    const producer = getProducer(tabId);
    producer.next({
      tabId
    });
    return producer;
  }

  function onUpdated(tabId, info, newState) {
    if (info.status === 'loading') {
      tabs.activeId = tabId;
      producers[tabId] = getInitialProducer(tabId);
      setBadge("",tabId);
    }
  }

  function renderPopup(container) {
    return Observable.create(() => {
      const producer = getProducer(tabs.activeId);
      ReactDOM.render(
        <Popup info={producer} />, container
      );
      return () => {
        ReactDOM.unmountComponentAtNode(container);
      };
    });
  }

  function initializeTabs() {
    browser.tabs.query({})
      .then(found => {
        for (var i in found) {
          producers[found[i].id] = new BehaviorSubject({tabId: found[i].id});
        }
      });
    browser.tabs.query({ active: true })
      .then(t => {
        tabs.activeId = t[0].id;
      });
  }

  // Messaging





  browser.webRequest.onCompleted.addListener(handleRequests, { urls: ["<all_urls>"] });
  browser.tabs.onActivated.addListener((info) => { tabs.activeId = info.tabId; if (tabs[tabs.activeId]) tabs.activeTab = tabs[tabs.activeId].tab });
  browser.tabs.onUpdated.addListener(onUpdated);
  browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
    delete tabs[tabId];
    delete producers[tabId];
  });

  initializeTabs();
  return { renderPopup, getProducer };
}

function setBadge(text, tabId) {
  browser.browserAction.setBadgeText({
    tabId: tabId ? tabId : tabs.active,
    text
  });
}

export function getProducer(tabId) {
  let producer = producers[tabId];

  if (!producer) {
    producer = new BehaviorSubject();
    producers[tabId] = producer;
  }

  return producer;
}

export function mergeWithProducer(tabId, object) {
  tabId = tabId || tabs.activeId;
  const producer = getProducer(tabId);
  var value = producer.value;
  if (value && object){
    value = Object.assign(value, object);
    producer.next(value);
  }
  if (value && object) producer.next(Object.assign(value, object));
}

export function updateLyricState(tab, body){
  const value = staticProducer.value;
  value[tab] = body;
  staticProducer.next(value);
}

function safeMatch(text, regex, index) {
  const matches = text.match(regex);
  if (matches && matches[index]) return matches[index];
  return;
}

export function exportFile(){
  var songs = [];
  const val = tabReloader.value;
  const keys = Object.keys(val);
  for(var i = 0; i < keys.length; i++){
    if(val[keys[i]])
      songs.push(cleanSong(lyricState[keys[i]]));
  }

  chrome.tabs.sendMessage(tabs.activeId, {type: "export" , title: Date.now().toString(), body: songs.join("\n\n\n")});
}

function cleanSong(song){
  return song.replace(/^\s+|\s+$/g,'');
}
