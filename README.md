# cmus-bundler

Plugin manager for [C* Music Player](https://github.com/cmus/cmus)

  * [Demo](#demo)
  * [Overview](#overview)
  * [Dependencies](#dependencies)
  * [Installation](#installation)
  * [Configuring rc file](#configuring-cmus-rc-file)
  * [Preinstall bundles](#preinstall-bundles)
  * [Showcases](#showcases)
  * [Debug](#debug)
  * [Known plugins](#known-plugins)
  * [Bugs/Issues](#bugsissues)

## Demo

<a href="http://www.youtube.com/watch?feature=player_embedded&v=nfspVtg_Hv8
" target="_blank"><img src="http://img.youtube.com/vi/nfspVtg_Hv8/0.jpg" 
alt="demo" width="560" height="315" border="10" /></a>

## Overview

[cmus](https://github.com/cmus/cmus) is awesome crossplatform cli player. it supports plugins and colorschemes like `vim` does.

`cmus-bundler` is plugins manager for cmus. like vim plugin managers are.


## Dependencies

  * cmus
  * nodejs
  * npm
  * git

## Installation

```shell
$ npm install -g cmus-bundler
```

```shell
$ cmus-bundler #make sure bundler installed successfuly

Usage: cmus-bundler [option]
...

```


## Configuring cmus `rc` file

To communicate with bundler daemon use cmus built-in command `shell`. In the `rc` file it'll look like:
```vim
shell cmus-bundler <command>
```

Run daemon (required):
```vim
shell cmus-bundler start
```

Set `cmus-bundler` as a status_display_program (optional):
```vim
set status_display_program=cmus-bundler
```

#### Available options

**start:** starts bundler daemon. **required command**.
```vim
shell cmus-bundler start [debug [debug_events]]

# examples:
# shell cmus-bundler start debug
# shell cmus-bundler start debug info plugin status_program
```

**set:** sets runtime variable. **_all variables pass to status programs as environment variables_**.
```vim
shell cmus-bundler set <key> <value>

# examples:
# shell cmus-bundler set LASTFM_USER my_username
# shell cmus-bundler set LASTFM_PASSWORD my_password
```

**plugin:** installs plugin to `~/.cmus/plugins`.
```vim
shell cmus-bundler plugin <user>/<repository_name> [install_command]

# install_command:
#   cmd <shell command>
#   <install_script>

# Runs command or executes file in <repository_name> directory
# Executable files must have correct rights

# examples:
# shell cmus-bundler plugin someauthor/someplugin cmd "sh install.sh"
# shell cmus-bundler plugin someauthor/someplugin install_script.sh
```

**theme:** installs theme to `~/.cmus/themes`. everything else the same as for **plugin**
```vim
shell cmus-bundler theme <user>/<repository_name> [install_command]
```

**status_program:** sets status program. in this case bundler works as a proxy between cmus and status program and passes environment variables from **set** option.
```vim
shell cmus-bundler status_program <repository_name>/<status_program_binary>

#or
# shell cmus-bundler status_program cmd <shell_command>

# set status_display_program=cmus-bundler
# required in this case
#
# examples:
# shell cmus-bundler status_program someplugin/status_program.sh
# shell cmus-bundler status_program cmd "node someplugin/script.js"
# shell cmus-bundler status_program cmd "echo $@ >> ~/status.txt"
```

**call:** calls plugin or executes shell command in `~/.cmus/plugins` directory.
```vim
shell cmus-bundler call <repository_name>/<plugin_binary>

# or
# shell cmus-bundler call cmd <shell_command>

# examples:
# shell cmus-bundler call someplugin/some_app.py
# shell cmus-bundler call cmd "python someplugin/some_app.py"
```

## Preinstall bundles
In order to be sure all plugins have been installed when you run cmus, recommended to preinstall all plugins/themes described in `rc` file once new plugins added:

```shell
$ cmus-bundler install
```

## Showcases

Here are a couple of example `rc` files for different cases

#### Setting up cmus as a music server

```vim
# start and write logs
shell cmus-bundler start debug >> ~/logs/cmus.txt

# serve logs directory
shell cmus-bundler call cmd "cd ~/logs && python -m SimpleHTTPServer 8081"

# install remote app plugin and it's dependencies
shell cmus-bundler plugin nogizhopaboroda/cmus_app cmd "pip install --user bottle sh"

# run remote app plugin
shell cmus-bundler call cmd "cd cmus_app && python app.py --noconfig --port 8080 --app-host localhost"
```

```shell
$ cmus-bundler install
$ cmus
```

Log:
http://localhost:8081/cmus.txt

Web interface:
http://localhost:8080/



#### Setting up cmus for everyday usage (tested on OS X)
```vim
# start bundler
shell cmus-bundler start

# install colorscheme
shell cmus-bundler theme alextercete/cmus-theme-screenshot
colorscheme themes/cmus-theme-screenshot/screenshot

# install cover-art plugin (iterm2 only)
shell cmus-bundler plugin nogizhopaboroda/cmus-cover-art cmd "sh install.sh"
shell cmus-bundler status_program cmus-cover-art/observe.sh

# control cmus via gloabl media keys
shell cmus-bundler plugin nogizhopaboroda/cmus-mediakeys cmd "npm install"
shell cmus-bundler call cmus-mediakeys/mediakeys

# set cmus-bundler as status program
set status_display_program=cmus-bundler
```

in one terminal tab run cmus:
```shell
$ cmus
```

in another terminal tab run cover-art viewer:
```shell
$ $(cmus-bundler -p)/cmus-cover-art/display.sh
```

## Debug

***
To debug plugins or cmus-bundler itself, pipe bundler's output into file and open this file via tail command
***

In `rc` file
```vim
shell cmus-bundler start debug >> <path_to_log_file>
```
Or print logs only from `plugin` command
```vim
shell cmus-bundler start debug plugin >> <path_to_log_file>
```

in one terminal tab run cmus:
```shell
$ cmus
```

in another terminal tab run tail:
```shell
$ tail -f <path_to_log_file>
```

***
To get current state of cmus-bundler daemon:
***

```shell
$ cmus-bundler get
```

## Known plugins

##### Themes
https://github.com/JustinPatricWade/cmus-theme_solar-mild

https://github.com/alextercete/cmus-theme-screenshot

https://github.com/prakhar1989/Gems

##### Plugins
https://github.com/jplitza/cmus-fullscreen

https://github.com/hakerdefo/cmus-lyrics

https://github.com/kiike/cmus-remote

https://github.com/equinox1993/CMUS-Lyrics-Plugin

https://github.com/tqmz/playlister

https://github.com/brendanwhitfield/itunes-to-cmus

https://github.com/jwohlert/raspberry-music

https://github.com/bilee/juke-x1

https://github.com/nogizhopaboroda/cmus_app

https://github.com/nogizhopaboroda/cmus-cover-art

https://github.com/freshprince/cmuscrobbler

https://github.com/Arkq/cmusfm

https://github.com/weisslj/cmus_lastfm_autoadd

https://github.com/TiredSounds/cmus-conky

https://github.com/cmus-plugins/cmus-base-plugins


## Bugs/Issues
Please report [here](https://github.com/nogizhopaboroda/cmus-bundler/issues)
