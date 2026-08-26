---
title: "GIT"
pubDate: 2011-02-16T12:10:57+01:00
description: "Some useful notes on GIT usage"
tags: ["SCM","GIT"]
category: "development"
heroImage: "/images/logo/git.png"
aliases: ["/post/dev/git","/wiki/Git"]
---

Some GIT commands I use and wanted to note for my own reference in case I don't use it anymore for some time and can't remember ;-)

<!--more-->

# Submodules
## Adding a submodule to a project
```bash
$ git submodule add <insert.repo.uri> destination/path
```

## Initialize submodules in a fresh checkout
```bash
$ git submodule init
$ git submodule update
```

## Fetch changes from submodule
Doing it for all existing submodules
```bash
$ git submodule foreach git pull
```
Doing it for only a specific submodule is standard git usage, you have to go to the root directory of the submodule and execute git pull or any other operation (including committing and pushing).

# Forking
## Adding upstream to your fork
```bash
$ git checkout master
$ git remote add upstream <insert.repo.uri>
$ git fetch upstream
$ git rebase upstream/master
```

# Hosting git repositories
Here are some projects which help you to self host your environment

* https://try.gitea.io/

# Initialize local git repository and create origin master
Go to the root directory you want for this repo and execute following commands
```bash
local$ git init
```
Create the repo on your server
```bash
local$ ssh server
server$ cd /path/to/git/root
server$ mkdir newrepo.git && cd newrepo.git
server$ git --bare init
server$ exit
```
Add the origin master to your local git
```bash
local$ git remote add origin ssh://server/path/to/repo.git
local$ git push origin master
```

# clone a git for local changes that can be pushed again to origin master
```bash
local$ git clone ssh://server/path/to/repo.git
```

# Remove files from git
In this example it's the .DS_Store file created automatically on a mac

```bash
local$ find . -depth -name '.DS_Store' -exec git rm --cached '{}' \; -print
```

## Add them to the ignore list
Execute this command in the root of the git directory
```bash
local$ echo ".DS_Store" >> .gitignore
local$ git add .gitignore
local$ git commit -m ".DS_Store removed and ignored"
```

### Ignores for mac client
```bash
.DS_Store
._*
```

### Ignores for working with latex
```bash
*.aux
*.dvi
*.ilg
*.ind
*.log
*.lol
*.out
*.toc
*.ps
*.glo
*.nlo
*.ilg
*.nls
*.bbl
*.blg
```

# Upload to remote master
If you have not added the origin yet, do this first
```bash
local$ git remote add origin ssh://server/path/to/repo.git
```

To push the files
```bash
local$ git push origin master
```
# Stay in sync with remote repository
```bash
local$ git pull origin master
```

# add changes
Add all changed / new files to the next commit
```bash
local$ git add .
```
or as a synonym you can use
```bash
local$ git stage .
```
Interactive session to choose which files to be added
```bash
local$ git add -i
```

# create local branch, do your work and merge it back to local master
New Branch from whatever branch you are in
```bash
local$ git branch task1
```

Do your changes and commit as usual.
You can even switch branches in between.

Switch to the master (or whatever branch you branched from)
```bash
local$ git checkout master
```

Merge your temporary branch into master
```bash
local$ git merge task1
```

Delete your temporary branch
```bash
local$ git branch -D task1
```

# Show me all branches
```bash
local$ git branch -a
```

# Switch branch
```bash
local$ git checkout master
```

# Show me changes since last commit
To see the actual code / cleartext:
```bash
local$ git diff --cached
```
or
```bash
local$ git diff --staged
```

More details and a nice graphic can be seen at http://365git.tumblr.com/post/474079664/whats-the-difference-part-1

# Save dirty code and revert back to HEAD
```bash
local$ git stash --keep-index
```

To restore into the dirty code (merging it into your current state)
```bash
local$ git stash apply
```

Detailed description of the stash command can be found at http://www.kernel.org/pub/software/scm/git/docs/git-stash.html

# Links
* http://help.github.com/removing-sensitive-data/
* http://www.uhlme.ch/artikel.php?artikel=git
* http://www.kernel.org/pub/software/scm/git/docs/gittutorial.html
* https://gist.github.com/569530
* http://www.kernel.org/pub/software/scm/git/docs/everyday.html
* http://365git.tumblr.com/post/474079664/whats-the-difference-part-1
* http://linux.yyz.us/git-howto.html
* http://cheat.errtheblog.com/s/git
* http://progit.org/book/