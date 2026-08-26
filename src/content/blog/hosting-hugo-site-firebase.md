---
title: "Hosting a Hugo Site with Firebase"
pubDate: 2017-03-05
description: "Howto host your Hugo site on firebase using gitlab for source and CI"
category: "howto"
tags: ["hugo", "firebase", "hosting"]
heroImage: /images/firebase.png
---

This are all the steps needed to deploy your static Hugo page on Firebase for free (until you exceed the traffic of the free tier a.k.a Spark plan).

## Firebase Setup

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and create a new project.
2. Install `firebase-tools` (node.js): `npm install -g firebase-tools`
3. Login to firebase: `firebase login` (opens a browser for authentication).
4. In the root of your Hugo site initialize: `firebase init`
5. Choose **Hosting** in the feature question.
6. Choose the project you just set up.
7. Accept the default for database rules file.
8. Accept the default for the publish directory which is `public`.
9. Choose **No** in the question if it is a single-page app.

## Deploy

Simply execute `hugo && firebase deploy` and your site will be up in no time.

Alternatively create a `deploy.sh` file:

```bash
#!/bin/sh
rm -rf public
hugo
firebase deploy
```

## CI Setup

1. Generate a deploy token using `firebase login:ci`
2. Setup your CI
3. Add the token to a private variable like `$FIREBASE_DEPLOY_TOKEN`

> This is a private secret and it should not appear in a public repository.

4. Add a step in your build to do `firebase deploy --token $FIREBASE_DEPLOY_TOKEN`

## Reference Links

- [Firebase CLI Reference](https://firebase.google.com/docs/cli/#administrative_commands)
