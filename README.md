# cmus-bundler

Plugin manager for [C* Music Player](https://github.com/cmus/cmus)


  * [Dependencies](#dependencies)
  * [Installation](#installation)
  * [Configuring rc file](#configuring-cmus-rc-file)
  * [Preinstall bundles](#preinstall-bundles)
  * [Showcases](#showcases)
  * [Debug](#debug)
  * [Known plugins](#known-plugins)
  * [Bugs/Issues](#bugsissues)



## Dependencies

  * cmus
  * nodejs
  * npm

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

Each command runs by:
```rc
shell cmus-bundler <command>
```
Set status display program:
```vim
set status_display_program=cmus-bundler
```

#### Available options

```vim
## start ##               #required command

shell cmus-bundler start [debug [debug_events]]

# examples:
# shell cmus-bundler start debug
# shell cmus-bundler start debug info plugin status_program
```

```vim
## set ##

shell cmus-bundler set <key> <value>

# examples:
# shell cmus-bundler set LASTFM_USER my_username
# shell cmus-bundler set LASTFM_PASSWORD my_password
```

```vim
## plugin ##

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

```vim
## theme ##

shell cmus-bundler theme <user>/<repository_name> [install_command]
```

```vim
## status_program ##

shell cmus-bundler status_program <repository_name>/<status_program_binary>

# examples:
# shell cmus-bundler status_program someplugin/status_program.sh
# shell cmus-bundler status_program cmd "node someplugin/script.js"
# shell cmus-bundler status_program cmd "echo $@ >> ~/status.txt"
```

```vim
## call ##

shell cmus-bundler call <repository_name>/<status_program_binary>

# examples:
# shell cmus-bundler call someplugin/some_app.py
# shell cmus-bundler call cmd "python someplugin/some_app.py"
```

## Preinstall bundles
In order to be sure all plugins have been installed when you run cmus, you can install all plugins/themes described in `rc` file:

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

# install remote app plugin
shell cmus-bundler plugin nogizhopaboroda/cmus_app cmd "pip install --user bottle sh"

# run remote app plugin
shell cmus-bundler call cmd "python cmus_app/app.py --noconfig --port 8080
```

```shell
$ cmus-bundler install
$ cmus
```

Log:

http://localhost:8081/cmus.txt

Web interface:

http://localhost:8080/



#### Setting up cmus for everyday usage
```vim
# start bundler
shell cmus-bundler start

# install colorscheme
shell cmus-bundler theme alextercete/cmus-theme-screenshot
colorscheme themes/cmus-theme-screenshot/screenshot

# install cover-art plugin
shell cmus-bundler plugin nogizhopaboroda/cmus-cover-art cmd "sh install.sh"
shell cmus-bundler status_program cmus-cover-art/observe.sh

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

- To debug plugins or cmus-bundler itself, pipe bundler's output into file and open this file via tail command

1) In `rc` file
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

- To get current state of cmus-bundler daemon:
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

## Bugs/Issues
Please report [here](https://github.com/nogizhopaboroda/cmus-bundler/issues)
