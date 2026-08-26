---
title: 'Scanning a Filesystem for Files with Weak Restrictions'
pubDate: 2008-06-05
description: 'Howto find world writable files that could be attacked on your server?'
category: "security"
tags: ["shell", "security", "linux", "hacking"]
---

Howto find world writable files that could be attacked on your server?

```bash
find / -type f \( ! -user root -perm -o+w \) -print
```
