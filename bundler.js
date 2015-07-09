#!/usr/local/bin/node

var fs = require('fs');
var spawn = require('child_process').spawn;


var program = require('commander');
var github_downloader = require('download-github-repo');


var HOME_DIR = process.env.HOME || process.env.USERPROFILE;
var CMUS_DIR = HOME_DIR + '/.cmus';
var THEMES_DIR = CMUS_DIR + '/themes';
var PLUGINS_DIR = CMUS_DIR + '/plugins';


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

function clone_repo(link, dest, cbk){
  dump(link + '  ' + dest + '/' + link.split('/')[1]);
  github_downloader(link, dest + '/' + link.split('/')[1], function(){
    dump(link + ' installed');
    cbk && cbk();
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
  clone_repo(program.theme, THEMES_DIR, function(){ 
    echo_cmus('theme ' + program.theme + ' installed');
  });
}
else if(program.plugin){
  dump('plug: ' + program.plugin + ' ');
  clone_repo(program.plugin, PLUGINS_DIR, function(){ 
    echo_cmus('plugin ' + program.plugin + ' installed');
  });
}
else {
  dump('just agruments \n-----' + JSON.stringify(program.args, null, 4) + '\n-------');
}

