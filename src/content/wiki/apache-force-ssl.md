---
title: 'Apache Force SSL on vhost'
pubDate: 2007-12-31
description: "Howto force all HTTP requests to HTTPS using Apache .htaccess rewrite rules."
category: "howto"
tags: ["security", "apache", "ssl"]
---

Force all HTTP requests to HTTPS using .htaccess:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```
