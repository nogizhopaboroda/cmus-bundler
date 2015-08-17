var spawn = require('child_process').spawn;
var colors = require('colors/safe');
var argv = require('optimist')
    .usage('Usage: $0')
    .describe('r', 'Respawn timeout')
    .describe('i', 'Initial timeout')
    .describe('c', 'Count of tests')
    .describe('q', 'Queue length needed')
    .demand('q')
    .argv;

var RESPAWN_TIMEOUT = argv.r || 3000,
    INIT_TIMEOUT    = argv.i || 3000,
    COUNT           = argv.c || 1,
    QUEUE_COUNT     = argv.q;


var stat = {
  "failed_tests": 0,
  "success_tests": 0,
  "missed_settings": 0
}

function run(counter){
  console.log('starting');

  var cmus_remote = spawn('cmus', []);

  cmus_remote.stdout.on('data', function (data) {
    //logger('stdout: ' + data, 'stdout');
  });

  cmus_remote.stderr.on('data', function (data) {
    process.exit(0);
  });

  cmus_remote.on('close', function (code) {
        if(counter < COUNT){
          setTimeout(function(){
            run(counter + 1);
          }, RESPAWN_TIMEOUT);
        } else {
          console.log(colors.yellow('total tests: ' + COUNT));
          console.log(colors.red('failed tests: ' + stat.failed_tests));
          console.log(colors.green('success tests: ' + stat.success_tests));
          console.log('\n');
          console.log(colors.red('missed settings: ' + stat.missed_settings));
          console.log(colors.blue('total settings: ' + +COUNT * +QUEUE_COUNT));
        }
  });

  setTimeout(function(){
    send_message(['get']);
  }, INIT_TIMEOUT);



  function send_message(message){
    var net = require('net');
    var client = net.connect(
      {path: __dirname + '/socket.sock'},
      function() { //'connect' listener
        client.write(JSON.stringify(message) + '\n');
      }
    );

    client.on('data', function(data) {
      var queue_length = JSON.parse(JSON.parse(data.toString())).queue.length;
      var color = 'green';
      if(+queue_length < +QUEUE_COUNT){
        color = 'red';
        stat.failed_tests++;
        stat.missed_settings += QUEUE_COUNT - queue_length;
      } else {
        stat.success_tests++;
      }
      console.log(colors[color]('queue length: ' + queue_length))
      console.log('killing\n\n');
      cmus_remote.kill();
      client.end();
    });
    client.on('end', function() {
    });
  }
}


run(1);
