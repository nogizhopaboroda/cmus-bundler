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
var status_programs = CMUS_DIR + '/status_display_programs.json';


function write_file(file, str, cbk){
  fs.writeFileSync(file, str);
  cbk && cbk();
}

function write_json(file, obj, cbk){
  write_file(file, JSON.stringify(obj), cbk);
}

function read_file(filename){
  return fs.readFileSync(filename, {'encoding': 'utf8'});
}

function read_json(filename){
  return JSON.parse(read_file(filename));
}

function dump(message){
  write_file(
    CMUS_DIR + "/bundler.log",
    message + '\n\n', 
    function() {
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

  if(fs.existsSync(target_dir)){
    dump(type + ': ' + link + ' already installed');
  } else {
    dump(type + ': ' + program.plugin + ' ');
    clone_repo(link, target_dir, function(){
      echo_cmus(type + ' ' + link + ' installed');
    });
  }

  fs.exists(target_dir, function(exists) {
    if(!exists){
    } else {
    }
  });
}


program
  .version('0.0.1')
  .option('startup', 'startup program')
  .option('theme [value]', 'theme')
  .option('plugin [value]', 'plugin')
  .option('status_program', 'status program')
  .parse(process.argv);


if(program.startup){
  write_file(status_programs, '[]');
  echo_cmus('startup!!!');
}
else if(program.theme){
  install_plugin('theme', program.theme);
}
else if(program.plugin){
  install_plugin('plugin', program.plugin);
}
else if(program.status_program){
  var programs = program.args;
  write_json(status_programs, programs);
  dump('status_program: ' + programs + ' appended');
}
else {
  dump('just agruments \n-----\n' + JSON.stringify(program.args, null, 4) + '\n-------');
}

