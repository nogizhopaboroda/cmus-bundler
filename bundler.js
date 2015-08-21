#!/usr/bin/env node

var package_info = require('./package.json');
var exec_async = require('child_process').exec;
var fs = require('fs');
var logger = require('./logger')();
var Client = require('./socket').Client;
var daemon = require('./daemon');

global.HOME_DIR = process.env.HOME || process.env.USERPROFILE;
global.CMUS_DIR = HOME_DIR + '/.cmus';
global.THEMES_DIR = CMUS_DIR + '/themes';
global.PLUGINS_DIR = CMUS_DIR + '/plugins';
global.DIRS = {
  'plugin': PLUGINS_DIR,
  'theme': THEMES_DIR,
};


if(process.argv[2] === 'start'){
  daemon.init();
} else if(process.argv[2] === 'install'){
  daemon.install();
} else if(process.argv[2] === 'plugin' || process.argv[2] === 'theme'){
  var message = process.argv.slice(2);
  install_plugin(message[0], message[1], message.slice(2));
} else if(process.argv[2] === 'plugins_path'){
  console.log(global.PLUGINS_DIR);
} else if(process.argv[2] === '-v' || process.argv[2] === 'version'){
  console.log(package_info.version);
} else if(process.argv[2] === '-h' || process.argv[2] === 'help'){
  console.log('help!!!');
} else {

    daemon.lookup(
      'start',
      function(){
        send_message(process.argv.slice(2));
      },
      function(){
        console.log('daemon is not running, command: ', process.argv.slice(2).join(' '));
      }
    );
}

function send_message(message){
  process.nextTick(function(){
    Client()
      .message(message)
      .error(function(e){
        logger('got error: ' + e.code, 'error');
      })
      .reconnect(function(current_turn){
        logger('reconnect #' + current_turn + '...\n', 'info');
      })
      .then(function(data){
        console.log(data);
      })
      .run();
  });
}

function clone_repo(link, target_dir, cbk){
  logger(link + ' -> ' + target_dir, 'plugin');
  daemon.run_plugin(["cmd", "git clone git@github.com:" + link + ".git " + target_dir], {}, function(){
    cbk && cbk();
  });
}

function install_plugin(type, link, postinstall){
  var parts = link.split('#');
  var target_dir =
    DIRS[type] +
    "/" +
    parts[0].split('/')[1];

  fs.exists(target_dir, function(exists){
    send_message(process.argv.slice(2));
    if(exists){
      logger(type + ': ' + link + ' already installed', type);
      send_message(process.argv.slice(2, 4).concat('ok'));
    } else {
      clone_repo(link, target_dir, function(){
        logger(link + ' installed', 'plugin');
        //cmus_remote.stdin.write('echo ' + type + ' ' + link + ' installed\n');
        if(postinstall.length > 0){
          daemon.run_plugin(
            postinstall,
            {cwd: target_dir},
            function(stdout){
              logger('after install plugin ' + link + ' got: ' + stdout, 'plugin');
              send_message(process.argv.slice(2, 4).concat('ok'));
            },
            function(error_message){
              logger('target_dir: ' + target_dir, 'plugin');
              logger('after install plugin ' + link + ' failed with: ' + error_message, 'plugin');
              send_message(process.argv.slice(2, 4).concat('ok'));
            }
          );
        } else {
          send_message(process.argv.slice(2, 4).concat('ok'));
        }
      });
    }
  });
}
