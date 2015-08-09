#!/usr/bin/env node

var ps = require('ps-node');
var dnode = require('dnode');
var package_info = require('./package.json');


if(process.argv[2] === 'start'){
  require('./daemon');
} else if(process.argv[2] === '-v' || process.argv[2] === 'version'){
  console.log(package_info.version);
} else if(process.argv[2] === '-h' || process.argv[2] === 'help'){
  console.log('help!!!');
} else {
    ps.lookup({
      command: 'node',
      arguments: 'start', //must be more arguments here
    }, function(err, resultList ) {
      if (err) {
        throw new Error( err );
      }
      send_message(process.argv.slice(2));
    });
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
