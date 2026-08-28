---
title: 'Using Google'
pubDate: 2008-01-04T14:35:41Z
description: "Reference of useful Google search operators and techniques for advanced web searching."
author: "Michel Racic"
category: "howto"
tags: ["google", "searching"]
aliases: ["/wiki/Using_Google"]
---

no comments...

<!--more-->

# search tools of google
* site - searching only on pages of this domain / subdoamins of this domain
* cache - searching in cache
* intitle - searches in title
* filetype - searching of a concrete file type
* inurl - searching of a term included in url
* allintext - searches text on a concrete page

# Netzwerk Kameras
* inurl:"viewerframe?mode=motion" (requires activeX)

* intitle:"snc-rz30 home" (requires activeX)

* intitle:"WJ-NT104 Main"

* inurl:LvAppl intitle:liveapplet (great pan and zoom)

* intitle:"Live View / - AXIS"

* inurl:indexFrame.shtml "Axis Video Server"

*  "powered by webcamXP"

# Pages that are hidden for google robots
* "robots.txt" "disallow:" filetype:txt

# Passwords
* intitle:index of ws_ftp.ini

* intitle:"index of" passwd passwd.bak

* inurl:passlist.txt

* inurl:password.txt

* inurl:config.php

* intext:(password | passcode) intext:(username | userid | user)   filetype:csv

* filetype:inc mysql_connect OR mysql_pconnect

# Frontpage 
* inurl:_vti_pvt "service.pwd"

# PHP PHOTO ALBUMS
* inurl:"phphotoalbum/upload"

# VNC Servers
*  "vnc desktop" inurl:5800
  bis port 5806

# PRINTER CONTROL PANELS
* intext"UAA(MSB)" Lexmark -ext:pdf
  
* inurl:"port_255" -htm

# phpMyAdmin
* intitle:phpMyAdmin "Welcome to phpMyAdmin ***" "running on * as root@*"

# secret documents
  intitle:"not for" filetype:doc site:gov

# eBook
* -inurl:(htm|html|php) intitle:"index of" +"last modified" +"parent directory" +description +size +(.txt|.lit|.doc|.rtf|.zip|.rar|.pdf|.chm) "hacking linux"

# Music
* -inurl:(htm|html|php) intitle:"index of" +"last modified" +"parent directory" +description +size +(.mp3|.wma|.ogg) "band name or song"
* "band name or song" -inurl:(htm|html|php|pls|txt) intitle:index.of "last modified" (wma|mp3) -"index-of-mp3" -vmp3 -shexy -pickbrains -kaboodle -mp3gle -ihackr -indexofmp3 -blogspot -franceradio -insanbilimleri -"english-4-free" -audiozen -hyooge -"game-freaks"

* intitle:"index.of" (mp3|mp4|avi) tricky -html -htm -php -asp -cf -jsp -e-mp3s.eu
# Video
* -inurl:(htm|html|php) intitle:"index of" +"last modified" +"parent directory" +description +size +(.mpg|.mpeg|.mov|.avi|.wmv|.di|.mp4) "video name"

# Serial Key, Licence
*  "computer profile summary" AND "licence" AND "key:" AND "vista"

# Links / Referenzen
* http://airdump.net/papers/google-hacking
* http://google.wikia.com/wiki/Google_Hacks
