---
title: 'Apache Wildcard Domains'
pubDate: 2007-12-31T11:27:23Z
description: "Apache VirtualHost configuration for wildcard domain routing with dynamic document roots."
heroImage: "/images/wiki/apache-wildcard-hero.svg"
author: "Michel Racic"
category: "howto"
tags: ["apache","wildcard","virtualhost","dns","domain"]
aliases: ["/wiki/Apache_Wildcard_Domains"]
---

Notizen zum konfigurieren von Wildcard Domains in Apache.

<!--more-->

Apache liest die files sequentiell ein, d.h. die Wildcard darf erst nach allen subdomains kommen (auch wenn sie in anderen files definiert werden) sprich in der allerletzten <VirtualServer> anweisung.

----

Im entsprechenden zone file folgende Zeile hinzufügen:
<pre>*.domain.tld.             IN      A               62.12.149.113</pre>

im entsprechenden apache virtualhost file folgende zeile nach "ServerName www.domain.tld" hinzufügen:
<pre>ServerAlias *.domain.tld</pre>

Reference doc: http://www.debian-administration.org/articles/358
