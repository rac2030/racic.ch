---
title: 'Using Google'
pubDate: 2008-01-04
description: "Reference of useful Google search operators and techniques for advanced web searching."
author: "Michel Racic"
category: "howto"
tags: ["google", "searching"]
aliases: ["/wiki/Using_Google"]
---

Google Hacking reference, something I always wanted to write down for myself.

**Note:** This is a collection of useful Google search operators and techniques. Some of these may not work anymore as Google updates their search algorithms.

## Basic Operators

- `OR` - Boolean OR
- `" "` - Exact match
- `+` - Force inclusion of common words
- `-` - Exclude a term
- `*` - Wildcard

## File Type Searching

`filetype:pdf` - Search for specific file types (pdf, doc, xls, ppt, etc.)

Example: `filetype:pdf site:example.com` - Find all PDFs on a specific site

## Site Search

`site:example.com` - Limit results to a specific site

`site:example.com filetype:pdf` - Find all PDFs on example.com

## Intitle and Inurl

`intitle:index of` - Find open directories

`inurl:admin` - Find pages with "admin" in the URL

`intitle:"index of" "parent directory"` - Find directory listings

## Cache and Related

`cache:example.com` - View Google's cached version

`related:example.com` - Find similar sites

## Combining Operators

You can combine operators for more precise results:

- `"machine learning" site:arxiv.org filetype:pdf` - PDFs about machine learning on arxiv.org
- `intitle:"index of" inurl:mp3` - Find open MP3 directories
- `site:*.gov filetype:pdf "confidential"` - Find potentially sensitive government documents

## Other Useful Tricks

- `define:word` - Get dictionary definition
- `weather:location` - Get weather forecast
- `stocks:SYMBOL` - Get stock information
- `map:location` - Get map results
