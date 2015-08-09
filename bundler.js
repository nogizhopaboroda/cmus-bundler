#!/usr/bin/env node

var dnode = require('dnode');
var package_info = require('./package.json');
var exec_async = require('child_process').exec;


if(process.argv[2] === 'start'){
  require('./daemon');
} else if(process.argv[2] === '-v' || process.argv[2] === 'version'){
  console.log(package_info.version);
} else if(process.argv[2] === '-h' || process.argv[2] === 'help'){
  console.log('help!!!');
} else {
  
    exec_async('which cmus-bundler', function(error, stdout, stderr){
      if (error !== null) {
        lookup(__filename);
      } else {
        lookup(stdout.replace('\n', ''));
      }
    });

    function lookup(bundler_path){
      exec_async('pgrep -f "node ' + bundler_path + ' start"', function(error, stdout, stderr){
        if (error !== null) {
          console.error('daemon is not running');
        } else {
          send_message(process.argv.slice(2));
        }
      });
    }
}


function send_message(message){
  var client = dnode.connect(5004);
  client.on('remote', function (remote) {
    remote.message(message, function (response) {
      console.log(response);
      client.end();
    });
  });
}
