---
title: 'Apache Wildcard Domains'
pubDate: 2007-12-31
description: "Apache VirtualHost configuration for wildcard domain routing with dynamic document roots."
author: "Michel Racic"
category: "howto"
tags: ["apache"]
---

Notizen zum Konfigurieren von Wildcard Domains in Apache.

```apache
<VirtualHost *:80>
    ServerName domain.tld
    ServerAlias *.domain.tld
    VirtualDocumentRoot /srv/www/%-2+/%-1+/%-0+/
</VirtualHost>
```
