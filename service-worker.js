
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
  console.log('Yay! Workbox is loaded');
} else {
  console.log('Boo! Workbox didn');
}

import {registerRoute} from 'workbox-routing';
import {NetworkFirst} from 'workbox-strategies';

registerRoute(
  /\.js$/,
  new NetworkFirst()
);