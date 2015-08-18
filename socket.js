var net = require('net');
var fs = require('fs');

var SOCKET_PATH = __dirname + '/socket.sock';
var MAX_RECONNECTS = 3;
var RECONNECT_TOMEOUT = 100;

function delete_socket(cbk){
  fs.unlink(SOCKET_PATH, function(){
    cbk && cbk();
  });
}

module.exports = {
  delete_socket: delete_socket,
  Client: function(){
    var q = {};
    return {
      error: function(cbk){
        q.on_error = cbk;
        return this;
      },
      reconnect: function(cbk){
        q.on_reconnect = cbk;
        return this;
      },
      message: function(message){
        q.message = message;
        return this;
      },
      then: function(cbk){
        q.on_success = cbk;
        return this;
      },
      run: function(current_turn){
        var self = this;

        var current_turn = current_turn || 0;

        var client = net.connect(
          {path: SOCKET_PATH},
          function() { //'connect' listener
            client.write(JSON.stringify(q.message) + '\n');
          }
        );
        client.on('data', function(data) {
          client.destroy();
          q.on_success && q.on_success(JSON.parse(data));
        });
        client.on('error', function(e) {
          //could be something better...
          q.on_error && q.on_error(e);
          if(current_turn < MAX_RECONNECTS){
            q.on_reconnect && q.on_reconnect(current_turn);
            setTimeout(function(){
              self.run(current_turn + 1);
            }, RECONNECT_TOMEOUT);
          }
        });
        client.on('timeout', function() { });
        client.on('end', function() { });
      }
    };
  },
  Server: function(){
    var q = {};

    function run(){
      var server = net.createServer({allowHalfOpen: true}, function(c) { //'connection' listener
        c.on('data', function(data) {
          q.on_message && q.on_message(JSON.parse(data), function(resp){
            process.nextTick(function(){
              c.write(JSON.stringify(resp) + '\n');
            });
          });
        });
        c.on('end', function() {});
      });
      server.listen(SOCKET_PATH, function() { /*'listening' listener */ });
    }

    return {
      then: function(cbk){
        q.on_message = cbk;
        return this;
      },
      run: function(){
        var self = this;

        fs.exists(SOCKET_PATH, function(exists) {
          if (exists) {
            delete_socket(run);
          } else {
            run();
          }
        });

      }
    };
  }
}
