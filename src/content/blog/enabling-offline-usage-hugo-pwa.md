---
title: "Enabling Offline Usage of a Hugo Site (PWA)"
pubDate: 2017-03-12T17:35:53+01:00
description: "Step-by-step guide to adding offline support to a Hugo static site using Service Workers and sw-precache for progressive web app capabilities."
author: "Michel Racic"
category: "howto"
tags: ["hugo", "pwa", "serviceworker"]
heroImage: /images/hugo/offline-dino.jpg
aliases: ["/post/hugo/pwa", "/hugo/pwa"]
---

PWA (Progressive Web Apps) are pretty cool for certain use cases like users having flaky connections (e.g. from mobiles) or just to reduce the initial loading time (after the first visit to the page). I document my exercise adding offline capability to a small single page site with no frequent updates that I built with Hugo and the Dimension theme.
<!--more-->

One thing to note is that ServiceWorkers only work when you server over SSL with a valid certificate. Also 
you have to keep in mind that this only works on modern browsers that stick to the PWA standards. Chrome and Microsoft Edge work (both are contributors to this standard) and for mobiles on Android it works pretty well. Users with iOS are out of luck as Safari doesn't support it and Safari is the only allowed engine to be used on iOS mobile devices (yes all the browser vendors that have an iOS app can't use their usual browser engine but can only have an overlay and need to use Safaris engine to process and render pages).
Nevertheless, you don't have to be bothered by this fact as the Service Worker in this case is only used for precaching and this means if it doesn't run, every request will be done as usual to the network, only users with PWA capable browsers will actually get a benefit out of it as it loads way faster on subsequent loads.

Note that I only applied this to a small Hugo site which is even compiled into a single page app, hence I just put all resources into precache. I would'nt use this strategy out of the box with a bigger site like a blog where you have lots of content. That is a future task I want to look in to get a service worker generator that adds some files (mainly static and a landing page) into precache and only caches other resources on first access to have a dynamic cache, for this I also need to find a strategy for updates as the precache has md5 hashes mapped in the service worker to know when to purge it and the Service Worker gets loaded on every access and updated from the network. Side effect of this is that every change is only visible after a reload of the page.

# Basic tools I used
`NodeJS` needs to be installed and usable in your system, additional the `gulp`, `sw-precache` and `run-sequence` modules need to be installed.
```sh
#/bin/sh
echo "Initialize build tools, needs working NPM installation to run"
npm install --save-dev sw-precache
npm install --save-dev run-sequence
npm install gulp-batch
npm install gulp
```

# Gulp build file
I created a gulpfile.js in the root of the Hugo project with the following content:
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
    /** This is the place where you could change / make the patterns on which files should be going into precache **/
    staticFileGlobs: [rootDir + '/**/*.{js,html,css,png,jpg,gif,eot,svg,ttf,woff,woff2,otf}'],
    stripPrefix: rootDir
  }, callback);
});

gulp.task('hugo:build', function() {
	var result = exec("hugo", {encoding: 'utf-8'});
    gutil.log('hugo:build: \n' + result);
    return result;
});

gulp.task('hugo:builddrafts', function() {
  var result = exec("hugo --buildDrafts", {encoding: 'utf-8'});
    gutil.log('hugo:builddrafts: \n' + result);
    return result;
});

gulp.task('hugo:clean', function() {
	var result = exec("rm -rf public/", {encoding: 'utf-8'});
    gutil.log('hugo:clean: \n' + result);
    return result;
});

gulp.task('build', function(callback) {
  runSequence('hugo:clean',
              'hugo:build',
              'generate-service-worker',
              callback);
});

gulp.task('build:drafts', function(callback) {
  runSequence('hugo:clean',
              'hugo:builddrafts',
              'generate-service-worker',
              callback);
});

gulp.task('deploy:dev', function(callback) {
  runSequence('build:drafts',
              'deploy:dev:rsync',
              callback);
});

gulp.task('deploy:prod', function(callback) {
  runSequence('build',
              'deploy:firebase',
              callback);
});

gulp.task('deploy:dev:rsync', function() {
  /** Change the rsync task accordingly to your dev deploy **/
  /** I mainly used this as firebase doesn't allow restriction on static files and this server is .htaccess protected so the people that need can have a short look prior to prod deploy **/
  var result = exec("rsync -rv --update --delete public rac@your.ssh.server:/var/www/rac/dev.something/", {encoding: 'utf-8'});
    gutil.log('deploy:dev: \n' + result);
    return result;
});

gulp.task('deploy:firebase', function() {
  var result = exec("firebase deploy", {encoding: 'utf-8'});
    gutil.log('deploy:dev: \n' + result);
    return result;
});
```

Now I can just use `$ gulp deploy:dev` to deploy it using `rsync` over SSH in order to give someone remote access or `$ gulp deploy:prod` to deploy it to the productive instance on firebase.

# Adding initializer to template
After looking at different implementations on how to best register the Service Worker, I ended up with following snippet (I think it's mainly code snippets from a sample of the google chrome team).
```html
<!-- Offline cache mit service worker -->
<script type="text/javascript">
	if('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register('/sw.js')
			.then(function() {});
	}
	'use strict';

	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', function() {
	    navigator.serviceWorker.register('/sw.js').then(function(reg) {
	      // updatefound is fired if sw.js changes.
	      reg.onupdatefound = function() {
	        var installingWorker = reg.installing;

	        installingWorker.onstatechange = function() {
	          switch (installingWorker.state) {
	            case 'installed':
	              if (navigator.serviceWorker.controller) {
	                console.log('New or updated content is available. Please refresh.');
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
</script>
```

# Results
To see the results, you can go to https://robinson-schule.ch (not existing anymore), then disable networking (e.g. in chrome dev tools marking Offline, or really disable your wifi / enable airplane mode) and reload the page or even better close it and enter the address again and you will still have access to the page unless you're using an Apple iOS based mobile device or Safari or InternetExplorer (only Edge supports it).

You can find more information on how to get started with PWA on the [Google developers PWA](https://developers.google.com/web/progressive-web-apps/) page.

# Other resources
* [An experiment in mixing Hugo and Polymer PRPL into a progressive web app blog](https://github.com/justinribeiro/blog-pwa)
* [Go offline! Service Worker and Hugo](https://gohugohq.com/howto/go-offline-with-service-worker/)
* [sw-precache library](https://github.com/GoogleChrome/sw-precache)
