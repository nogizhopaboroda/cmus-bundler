#!/usr/bin/env node

var package_info = require('./package.json');
var exec_async = require('child_process').exec;


if(process.argv[2] === 'start'){
  setImmediate(function(){
    require('./daemon');
  });
} else if(process.argv[2] === '-v' || process.argv[2] === 'version'){
  console.log(package_info.version);
} else if(process.argv[2] === '-h' || process.argv[2] === 'help'){
  console.log('help!!!');
} else {
  
    exec_async('which cmus-bundler', function(error, stdout, stderr){
      if (error !== null) {
        setImmediate(function(){
          lookup(__filename);
        });
      } else {
        setImmediate(function(){
          lookup(stdout.replace('\n', ''));
        });
      }
    });

    function lookup(bundler_path){
      exec_async('pgrep -f "node ' + bundler_path + ' start"', function(error, stdout, stderr){
        if (error !== null) {
          console.log('daemon is not running, command: ', process.argv.slice(2).join(' '));
        } else {
          //send_message(process.argv.slice(2));
          var tmt = 0;
          //if(process.argv[2] === 'set'){
            //tmt = 100;
          //}
          //if(process.argv[2] === 'plugin'){
            //tmt = 200;
          //}
          //if(process.argv[2] === 'theme'){
            //tmt = 300;
          //}
          //if(process.argv[2] === 'call'){
            //tmt = 400;
          //}
          //if(process.argv[2] === 'status_program'){
            //tmt = 500;
          //}
          //setTimeout(function(){
            //console.log("vt program: ", process.argv.slice(2));
            //send_m(process.argv.slice(2));
          //}, tmt);
          //setTimeout(function(){
            send_m(process.argv.slice(2), 0);
          //}, 500);
        }
      });
    }
}


var MAX_RECONNECTS = 3;
var RECONNECT_TOMEOUT = 100;

var net = require('net');
function send_m(message, current_turn){
  //console.log("vt program: ", process.argv.slice(2));
  var client = net.connect({path: __dirname + '/socket.sock'},
                           function() { //'connect' listener
    //bottleneck!!!
    //
    //console.log('connected to server!');
    setImmediate(function(){
      client.write(JSON.stringify(message) + '\n');
    });
  });
  client.on('data', function(data) {
    console.log(JSON.parse(JSON.parse(data)), "program: ", message);
    setImmediate(function(){
      client.end();
      process.exit(0);
    });
  });
  client.on('connect', function(e) {
    //console.log('connect');
  });
  client.on('error', function(e) {
    //could be something better...
    console.log('error!!!!, ', e);
    if(current_turn < MAX_RECONNECTS){
      console.log('reconnect');
      setTimeout(function(){
        send_m(message, current_turn + 1);
      }, RECONNECT_TOMEOUT);
    }
  });
  client.on('timeout', function() {
    console.log('timeout!!!!');
  });
  client.on('end', function() {
    //console.log('disconnected from server');
  });
}
