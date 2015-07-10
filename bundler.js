#!/usr/local/bin/node

var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');


var program = require('commander');
var github_downloader = require('download-github-repo');


var HOME_DIR = process.env.HOME || process.env.USERPROFILE;
var CMUS_DIR = HOME_DIR + '/.cmus';
var THEMES_DIR = CMUS_DIR + '/themes';
var PLUGINS_DIR = CMUS_DIR + '/plugins';
var DIRS = {
  'plugin': PLUGINS_DIR,
  'theme': THEMES_DIR,
};


function dump(message){
  fs.writeFile(
    CMUS_DIR + "/bundler.log", 
    message + '\n\n', 
    function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("[LOG]: " + message);
    }
  ); 
}

function run_cmd(cmd, args, callBack ) {
    var child = spawn(cmd, args);
    var resp = "";
 
    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
}

function echo_cmus(message){
  run_cmd( "cmus-remote", ["-C", "echo " + message], function(text) { dump("got from cmus: " + text) });
}

function clone_repo(link, target_dir, cbk){
  dump(link + ' -> ' + target_dir);
  github_downloader(link, target_dir, function(){
    dump(link + ' installed');
    cbk && cbk();
  });
}

function install_plugin(type, link){
  var parts = link.split('#');
  var target_dir = 
    DIRS[type] +
    "/" +
    parts[0].split('/')[1];

  fs.exists(target_dir, function(exists) {
    if(!exists){
      dump(type + ': ' + program.plugin + ' ');
      clone_repo(link, target_dir, function(){ 
        echo_cmus(type + ' ' + link + ' installed');
      });
    } else {
      dump(type + ': ' + link + ' already installed');
    }
  });
}


program
  .version('0.0.1')
  .option('startup', 'startup program')
  .option('theme [value]', 'theme')
  .option('plugin [value]', 'plugin')
  .option('status_program [value]', 'status program')
  .parse(process.argv);


if(program.startup){
  echo_cmus('startup!!!');
}
else if(program.theme){
  install_plugin('theme', program.theme);
}
else if(program.plugin){
  install_plugin('plugin', program.plugin);
}
else {
  dump('just agruments \n-----' + JSON.stringify(program.args, null, 4) + '\n-------');
}

