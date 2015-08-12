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
        if(counter < 5){
          setTimeout(function(){
            run(counter + 1);
          }, 5000);
        }
    //process.exit(0);
  });

  setTimeout(function(){
    send_message(['get']);
  }, 5000);



  var dnode = require('dnode');
  function send_message(message){
    var client = dnode.connect(5004);
    client.on('remote', function (remote) {
      remote.message(message, function (response) {
        console.log(JSON.parse(response).queue.length);
        client.end();
        console.log('killing\n\n');

        cmus_remote.kill();

      });
    });
  }
}


run(0);
