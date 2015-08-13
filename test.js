var colors = require('colors/safe');

function run(counter){
  console.log('starting');
  var spawn = require('child_process').spawn;

  var cmus_remote = spawn('cmus', []);

  cmus_remote.stdout.on('data', function (data) {
    //logger('stdout: ' + data, 'stdout');
  });

  cmus_remote.stderr.on('data', function (data) {
    process.exit(0);
  });

  cmus_remote.on('close', function (code) {
        if(counter < 2){
          setTimeout(function(){
            run(counter + 1);
          }, 3000);
        }
    //process.exit(0);
  });

  setTimeout(function(){
    send_message(['get']);
  }, 3000);



  function send_message(message){
    var net = require('net');
    var client = net.connect({path: __dirname + '/socket.sock'},
                             function() { //'connect' listener
      client.write(JSON.stringify(message) + '\n');
    });

    client.on('data', function(data) {
      var queue_length = JSON.parse(JSON.parse(data.toString())).queue.length;
      if(queue_length < 10){
        console.log(colors.red('queue length: ' + queue_length));
        //cmus_remote.kill();
        process.exit(0);
      } else {
        console.log(colors.green('queue length: ' + queue_length));
      }
      console.log('killing\n\n');
      cmus_remote.kill();
      client.end();
    });
    client.on('end', function() {
    });
  }
}


run(0);
