---
title: 'Apache Force SSL on vhost'
pubDate: 2007-12-31T11:44:11Z
description: "Howto force all HTTP requests to HTTPS using Apache .htaccess rewrite rules."
author: "Michel Racic"
category: "howto"
tags: ["security", "apache", "ssl"]
aliases: ["/wiki/Apache_Force_SSL_on_vhost"]
---

Howto configure Apache to redirect all http requests to the SSL version of the site.

<!--more-->

Edit your htaccess (or server conf file) to look like this one :
```xml
<Files *.ini>
Order Allow,Deny
Deny from all
</Files>

RewriteEngine on
RewriteBase /

RewriteCond %{SERVER_PORT} !443
RewriteRule ^(.*)?$ https://%{SERVER_NAME}$1 [L,R]
```
For thoses of you who don't know about RewriteCond, the first one checks the server port used to connect. If it's not 443 (default HTTPS port), it redirects all request to the same https vhost and URI.


<strong>Reference</strong>
<li> https://trac.usvn.info/wiki/Documentation/HTTPSAccess</li>
