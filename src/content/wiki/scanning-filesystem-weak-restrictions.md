---
title: 'Scanning a Filesystem for Files with Weak Restrictions'
pubDate: 2008-06-05
description: 'Howto find world writable files that could be attacked on your server?'
heroImage: "/images/wiki/scanning-filesystem-hero.svg"
author: "Michel Racic"
category: "security"
tags: ["shell","security","linux","permissions","filesystem"]
---

Howto find world writable files that could be attacked on your server?

```bash
find / -type f \( ! -user root -perm -o+w \) -print
```
