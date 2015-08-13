#!/usr/bin/env node

var dnode = require('dnode');
var package_info = require('./package.json');
var exec_async = require('child_process').exec;


if(process.argv[2] === 'start'){
  process.nextTick(function(){
    require('./daemon');
  });
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
        lookup(stdout.replace('\n', ''));
      }
    });

    function lookup(bundler_path){
      exec_async('pgrep -f "node ' + bundler_path + ' start"', function(error, stdout, stderr){
        if (error !== null) {
          console.log('daemon is not running, command: ', process.argv.join(' '));
        } else {
          //send_message(process.argv.slice(2));
          var tmt = 0;
          if(process.argv[2] === 'set'){
            tmt = 100;
          }
          if(process.argv[2] === 'plugin'){
            tmt = 200;
          }
          if(process.argv[2] === 'theme'){
            tmt = 300;
          }
          if(process.argv[2] === 'call'){
            tmt = 400;
          }
          if(process.argv[2] === 'status_program'){
            tmt = 500;
          }
          setTimeout(function(){
            console.log("vt program: ", process.argv.slice(2));
            send_m(process.argv.slice(2));
          }, tmt);
        }
      });
    }
}


//function send_message(message){
  //var client = dnode.connect(5004);
  //client.on('remote', function (remote) {
    //remote.message(message, function (response) {
      //console.log(response);
      //client.end();
    //});
  //});
//}



var net = require('net');
function send_m(message){
  //console.log("vt program: ", process.argv.slice(2));
  var client = net.connect({path: __dirname + '/socket.sock', allowHalfOpen: true},
                           function() { //'connect' listener
    //bottleneck!!!
    //
    //console.log('connected to server!');
    client.write(JSON.stringify(message) + '\n');
  });
  client.on('data', function(data) {
    console.log(JSON.parse(JSON.parse(data)), "program: ", message);
    client.end();
    process.exit(0);
  });
  client.on('end', function() {
    //console.log('disconnected from server');
  });
}
