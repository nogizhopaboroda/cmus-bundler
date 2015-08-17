#!/usr/bin/env node

var package_info = require('./package.json');
var exec_async = require('child_process').exec;
var logger = require('./logger')();
var Client = require('./socket').Client;


if(process.argv[2] === 'start'){
  require('./daemon');
} else if(process.argv[2] === '-v' || process.argv[2] === 'version'){
  console.log(package_info.version);
} else if(process.argv[2] === '-h' || process.argv[2] === 'help'){
  console.log('help!!!');
} else {
  
    exec_async('which cmus-bundler', function(error, stdout, stderr){
      if (error !== null) {
        process.nextTick(function(){
          lookup(__filename);
        });
      } else {
        process.nextTick(function(){
          lookup(stdout.replace('\n', ''));
        });
      }
    });

    function lookup(bundler_path){
      exec_async('pgrep -f "node ' + bundler_path + ' start"', function(error, stdout, stderr){
        if (error !== null) {
          console.log('daemon is not running, command: ', process.argv.slice(2).join(' '));
        } else {
          process.nextTick(function(){
            Client()
              .message(process.argv.slice(2))
              .error(function(e){
                logger('got error: ' + e.code, 'error');
              })
              .reconnect(function(current_turn){
                logger('reconnect #' + current_turn + '...\n', 'info');
              })
              .then(function(data){
                console.log(data);
                process.nextTick(function(){
                  process.exit(0);
                });
              })
              .run();
          });
        }
      });
    }
}


