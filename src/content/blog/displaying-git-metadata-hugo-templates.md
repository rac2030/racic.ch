---
title: "Displaying GIT Metadata in Hugo Templates"
pubDate: 2017-02-21
description: "Display GIT metadata in Hugo"
category: "howto"
tags: ["hugo", "git"]
heroImage: /images/git.png
---

In order to display the last updated timestamp of a page, I had to set [EnableGitInfo](https://gohugo.io/extras/gitinfo/) to `true` in the `config.toml` but this caused CI on wercker to fail as soon as I did a `git push`.

After some analysis, I found the root cause was with Unicode filenames which I used for some easter eggs failing when `gitinfo.go` tries to fetch info for every file it encountered. I filed this on [hugo-3071](https://github.com/spf13/hugo/issues/3071). While git itself had no troubles working with this, it did add it to the repository as `content/\360\237\222\251.md` and this then caused the failing on getting the meta data in `gitinfo.go`.

## Solution

The solution was suggested by [bep](https://github.com/bep) and was to set the git option `core.quotePath` to false:

```bash
git config --global core.quotePath false
```

This worked on my local system (OSX) as well as on the [Debian](https://www.debian.org) wercker box.

The `wercker.yml` now looks like:

```yaml
box: debian
build:
  steps:
    - install-packages:
        packages: git
    - script:
        name: Set git config core.quotePath to false for emoji filenames
        code: git config --global core.quotePath false
    - arjen/hugo-build@1.14.1:
        version: "0.18.1"
        theme: mainroad
        flags: --buildDrafts=false

deploy:
  steps:
    - install-packages:
        packages: git ssh-client
    - lukevivier/gh-pages@0.2.1:
        token: $GIT_TOKEN
        domain: rac.su
        basedir: public
```

## Template Integration

I added this snippet to `layouts/_default/single.html`:

```html
<time class="post__meta-date" datetime="{{ .Date }}">
  {{.Date.Format "January 02, 2006"}}
</time>
{{ if .GitInfo }}
  (<time class="post__meta-date" datetime="{{ .GitInfo.AuthorDate }}">
    {{.GitInfo.AuthorDate.Format "Last modified on January 02, 2006"}}
  </time>)
{{ end }}
```
