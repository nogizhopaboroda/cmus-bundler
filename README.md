# cmus-bundler

Plugin manager for [C* Music Player](https://github.com/cmus/cmus).

About
-----
cmus-bundler provides an easy way to install themes or status display programs from github and use a set of status display programs instead of only one.

Installation
------------
```shell
npm install -g cmus-bundler
```

Setup
-----

1) Make sure after installation that `cmus-bundler` command is available globally:
```shell
cmus-bundler -V
```
should print current version

1) Confugure bundles in `rc` file


Configuring bundles
-------------------
1) Possible options:

**theme** : installs colorscheme

synopsis:
```
shell cmus-bundler theme <user>/<repository_name>
```

**plugin** : installs status display program plugin

synopsis:
```
shell cmus-bundler plugin <user>/<repository_name>
```
**status_program** : sets status display program(s)

synopsis:
```
shell cmus-bundler status_program <repository_name>/<plugin_binary> [<repository_name>/<plugin_binary> ...]
```

2) Sample `rc` file:
```vim
shell cmus-bundler theme alextercete/cmus-theme-screenshot
shell cmus-bundler theme prakhar1989/Gems
colorscheme themes/Gems/gems

shell cmus-bundler plugin nogizhopaboroda/cmus-cover-art
 
shell cmus-bundler status_program cmus-cover-art/observe.sh
set status_display_program=cmus-bundler
```

Bugs/Issues
-----------

Please report [here](https://github.com/nogizhopaboroda/cmus-bundler/issues)
