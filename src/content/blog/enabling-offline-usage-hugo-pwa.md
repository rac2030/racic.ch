---
title: "Enabling Offline Usage of a Hugo Site (PWA)"
pubDate: 2017-03-12
description: "Step-by-step guide to adding offline support to a Hugo static site using Service Workers and sw-precache for progressive web app capabilities."
author: "Michel Racic"
category: "howto"
tags: ["hugo", "pwa", "serviceworker"]
heroImage: /images/hugo/offline-dino.jpg
---

![Offline Dino](/images/hugo/offline-dino.jpg)

PWA (Progressive Web Apps) are pretty cool for certain use cases like users having flaky connections (e.g. from mobiles) or just to reduce the initial loading time (after the first visit to the page). I document my exercise adding offline capability to a small single page site with no frequent updates that I built with Hugo and the Dimension theme.

**Note:** ServiceWorkers only work when you serve over SSL with a valid certificate. Also you have to keep in mind that this only works on modern browsers that stick to the PWA standards. Chrome and Microsoft Edge work (both are contributors to this standard) and for mobiles on Android it works pretty well.

The Service Worker in this case is only used for precaching — if it doesn't run, every request will be made as usual to the network. Only users with PWA capable browsers will actually get a benefit out of it as it loads way faster on subsequent loads.

## Basic Tools I Used

`NodeJS` needs to be installed and usable in your system, additionally the `gulp`, `sw-precache` and `run-sequence` modules need to be installed.

```bash
npm install --save-dev sw-precache
npm install --save-dev run-sequence
npm install gulp-batch
npm install gulp
```

## Gulp Build File

I created a `gulpfile.js` in the root of the Hugo project with the following content:

```js
var gulp = require('gulp');
var gutil = require('gulp-util');
var exec = require('child_process').execSync;
var runSequence = require('run-sequence');

gulp.task('generate-service-worker', function(callback) {
  var path = require('path');
  var swPrecache = require('sw-precache');
  var rootDir = 'public';

  swPrecache.write(path.join(rootDir, 'sw.js'), {
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,eot,svg,ttf,woff,woff2,otf}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('hugo:build', function() {
  var result = exec("hugo", {encoding: 'utf-8'});
  gutil.log('hugo:build: \n' + result);
  return result;
});

gulp.task('build', function(callback) {
  runSequence('hugo:clean', 'hugo:build', 'generate-service-worker', callback);
});

gulp.task('deploy:prod', function(callback) {
  runSequence('build', 'deploy:firebase', callback);
});
```

## Adding the Service Worker Initializer

After looking at different implementations on how to best register the Service Worker, I ended up with this snippet:

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      reg.onupdatefound = function() {
        var installingWorker = reg.installing;
        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                console.log('New or updated content is available.');
              } else {
                console.log('Content is now available offline!');
              }
              break;
            case 'redundant':
              console.error('The installing service worker became redundant.');
              break;
          }
        };
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  });
}
```

## Results

To see the results, disable networking (e.g. in Chrome dev tools marking Offline) and reload the page. You will still have access to the page.

## Other Resources

- [An experiment in mixing Hugo and Polymer PRPL into a progressive web app blog](https://github.com/justinribeiro/blog-pwa)
- [Go offline! Service Worker and Hugo](https://gohugohq.com/howto/go-offline-with-service-worker/)
- [sw-precache library](https://github.com/GoogleChrome/sw-precache)
