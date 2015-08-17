var net = require('net');

var SOCKET_PATH = __dirname + '/socket.sock';
var MAX_RECONNECTS = 3;
var RECONNECT_TOMEOUT = 100;

module.exports = {
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

        current_turn = current_turn || 0;

        var client = net.connect(
          {path: SOCKET_PATH},
          function() { //'connect' listener
            client.write(JSON.stringify(q.message) + '\n');
          }
        );
        client.on('data', function(data) {
          client.destroy();
          q.on_success && q.on_success(JSON.parse(JSON.parse(data)));
        });
        client.on('error', function(e) {
          //could be something better...
          q.on_error && q.on_error(e);
          if(current_turn < MAX_RECONNECTS){
            q.on_reconnect && q.on_reconnect(current_turn);
            setTimeout(function(){
              self.run(q.message, current_turn + 1);
            }, RECONNECT_TOMEOUT);
          }
        });
        client.on('timeout', function() { });
        client.on('end', function() { });
      }
    }
  }
}
