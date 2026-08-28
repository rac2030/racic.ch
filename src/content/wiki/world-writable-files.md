---
title: "Finding World-Writable Files"
pubDate: 2008-06-05T14:45:52+01:00
description: "Howto find world writable files that could be attacked on your server?"
author: "Michel Racic"
tags: ["shell","security","linux","hacking"]
category: "security"
heroImage: ''
aliases: ["/security/scanning-filesystem-files-with-weak-retriktions"]
---

Howto find world writable files that could be attacked on your server?

<!--more-->

```bash
find / -perm -2 ! -type l -ls
```