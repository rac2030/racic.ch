---
title: "Hosting a Hugo Site with Firebase"
pubDate: 2017-03-05T00:09:41+01:00
description: "Howto host your Hugo site on firebase using gitlab for source and CI"
author: "Michel Racic"
category: "howto"
tags: ["hugo", "firebase", "hosting"]
heroImage: /images/firebase.png
aliases: ["/post/hugo/firebase", "/hugo/firebase"]
---

This are all the steps needed to deploy your static [Hugo](/tags/hugo) page on [Firebase](/tags/firebase) for free (until you exceed the traffic of the free tier a.k.a Spark plan).
<!--more-->

# Firebase

## Setup
1. Go to https://console.firebase.google.com and create a new project (unless you already have a project and this is just an additional component to it). 
2. Install `firebase-tools` (node.js) using: `npm install -g firebase-tools`
3. Login to firebase (setup on your local machine) using `firebase login` which opens a browser and you can select your account. Use `firebase logout` in case you are already logged in but to the wrong account.
3. In the root of your hugo site initialize the Firebase project with `firebase init`
4. Choose Hosting in the feature question
5. Choose the project you did just setup
6. Accept the default for database rules file
7. Accept the default for the publish directory which is `public`
8. Choose No in the question if it is a single-page app

## Deploy
Simply execute `hugo && firebase deploy` and your site will be up in no time.

Alternatively Create a `deploy.sh` file with the following content and make it executable `chmod +x deploy.sh`:

```sh
#!/bin/sh
rm -rf public
hugo
firebase deploy
```

## CI Setup
1. Generate a deploy token using `firebase login:ci`
2. Setup your CI
3. Add the token to a private variable like `$FIREBASE_DEPLOY_TOKEN`

> This is a private secret and it should not appear in a public repository. Make sure you understand you chosen CI and that it's not visible to others.

4. Add a step in your build to do `firebase deploy --token $FIREBASE_DEPLOY_TOKEN`

## Map a custom domain to a Firebase project
//TODO

# Gitlab.com

## Configure CI runner
1. Get a deploy token for your Firebase project executing ```firebase login:ci```which will bring up a browser with the authentication dialog and afterwards gives you a token to be used in CI
2. In your GitLab project, go to Pipelines > Environments and then add a new environment called Production

//TODO

## Reference links
* [Firebase CLI Reference](https://firebase.google.com/docs/cli/#administrative_commands)
