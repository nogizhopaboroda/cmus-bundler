#!/usr/bin/env node

var package_info = require('./package.json');
var exec_async = require('child_process').exec;
var net = require('net');
var logger = require('./logger')();

var MAX_RECONNECTS = 3;
var RECONNECT_TOMEOUT = 100;


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
            send_m(process.argv.slice(2), 0);
          });
        }
      });
    }
}


function send_m(message, current_turn){
  var client = net.connect(
    {path: __dirname + '/socket.sock'},
    function() { //'connect' listener
      client.write(JSON.stringify(message) + '\n');
    }
  );
  client.on('data', function(data) {
    console.log(JSON.parse(JSON.parse(data)));
    client.destroy();
    process.nextTick(function(){
      process.exit(0);
    });
  });
  client.on('error', function(e) {
    //could be something better...
    logger('got error: ' + e.code, 'error');
    if(current_turn < MAX_RECONNECTS){
      logger('reconnect #' + current_turn + '...\n', 'info');
      setTimeout(function(){
        send_m(message, current_turn + 1);
      }, RECONNECT_TOMEOUT);
    }
  });
  client.on('timeout', function() { });
  client.on('end', function() { });
}
