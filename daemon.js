var spawn = require('child_process').spawn;
var fs = require('fs');
var exec_async = require('child_process').exec;
var execFile = require('child_process').execFile;
var net = require('net');

var Socket = require('./socket');
var Server = Socket.Server;
var delete_socket = Socket.delete_socket;
var logger = require('./logger')(process.argv[3] === 'debug' ? process.argv.slice(4) : ['info']);


var children = [];
var state = {
  "variables": {},
  "status_programs": [],
  "queue": []
};

  
function init(){
  var cmus_remote = spawn('cmus-remote', []);

  cmus_remote.stdout.on('data', function (data) {
    logger('stdout: ' + data, 'stdout');
  });

  cmus_remote.stderr.on('data', function (data) {
    logger('stderr: ' + data, 'warning');
    logger('graceful shutdown', 'info');

    children.forEach(function(child){
      child.kill();
    });

    delete_socket(function(){
      logger('deleting socket', 'info');
      process.exit(0);
    });

  });

  cmus_remote.on('close', function (code) {
    logger('child process exited with code ' + code, 'info');
    process.exit(0);
  });

  setInterval(function(){
    cmus_remote.stdin.write('\n');
  }, 1000);

  Server()
    .then(on_message)
    .run()

  logger('daemon started\n', 'info');
}

function on_message(message, cb){

    state.queue.push(message.join(' '));

    switch(message[0]){
      case "set":
        logger('setting variable ' + message[1] + ': ' + message[2], message[0]);
        state.variables[message[1]] = message[2];
        cb('ok');
        break;
      case "get":
        cb(JSON.stringify(state));
        break;
      case "call":
        run_plugin(
          message.slice(1),
          {cwd: PLUGINS_DIR},
          function(stdout){
            logger('got from program: ' + stdout, 'call');
            cb('ok');
          },
          function(error_message){
            logger('program failed: ' + error_message, 'call');
            cb('ok');
          }
        );
        logger('calling ' + message[1] + '; arguments: ' + message.slice(2).join(', '), message[0]);
        break;
      case "plugin":
      case "theme":
        logger('installing ' + message[0] + ': ' + message[1], message[0]);
        cb('ok');
        break;
      case "status_program":
        logger('setting status program: ' + message[1] + ', arguments: ' + message.slice(2), message[0]);
        state.status_programs.push(message[1] !== 'cmd' ? message[1] : message.slice(1));
        cb('ok');
        break;
      case "status":
        logger('got status: ' + message.join(' '), message[0]);

        state.status_programs.forEach(function(status_program){
          run_plugin(
            [].concat(status_program).concat(message),
            {env: state.variables},
            function(stdout){
              logger('got from status program ' + status_program + ': ' + stdout, 'plugin');
            },
            function(error_message){
              logger('status program ' + status_program + ' failed. error:\n' + error_message + '\n', 'plugin');
            }
          );
        });
      
        cb('ok');
        break;
      default:
        logger('unknown command: ' + message.join(' '), 'unknown');
        cb('ok');
    }
}

function run_plugin(cmd_array, options, success_callback, error_callback){
  if(cmd_array[0] === 'cmd'){
    var child_process = exec_async(cmd_array.slice(1).join(' '), options, function(error, stdout, stderr){
      if (error !== null && error_callback) {
        error_callback(error.stack);
      } else {
        success_callback && success_callback(stdout);
      }
    });
  } else {
    var script_name = PLUGINS_DIR + '/' + cmd_array[0];
    var child_process = execFile(script_name, cmd_array.slice(1), options, function(error, stdout, stderr){
      if (error !== null && error_callback) {
        error_callback(error.stack);
        child_process.kill();
      } else {
        success_callback && success_callback(stdout);
      }
    });
    return child_process;
  }

  children.push(child_process);
}

function lookup_self(command, ifyes_callback, ifno_callback){
    exec_async('which cmus-bundler', function(error, stdout, stderr){
      var bundler_path;
      if (error !== null) {
        bundler_path = module.parent.filename;
      } else {
        bundler_path = stdout.replace('\n', '');
      }
      process.nextTick(function(){
        exec_async('pgrep -f "node ' + bundler_path + ' ' + command + '"', function(error, stdout, stderr){
          if (error !== null) {
            ifno_callback();
          } else {
            ifyes_callback();
          }
        });
      });
    });
}


var install_queue = {};
function install(){
  console.log('waiting...');
  Server()
    .then(function(message, cb){
      if(message[0] === 'theme' || message[0] === 'plugin'){
        if(message[2] === 'ok'){
          setTimeout(function(){
            install_queue[message[1]] = true;
            console.log(666, message);

            var need_exit = true;
            for(var key in install_queue){
              if(install_queue[key] === false){
                need_exit = false;
                break;
              }
            }
            need_exit && process.exit(0);

            cb('ok');
          }, 100);
        } else {
          install_queue[message[1]] = false;
          //console.log(message);
          cb('ok');
        }
      }
    })
    .run()
}


module.exports = {
  run_plugin: run_plugin,
  init: function(){
    lookup_self(
      'install',
      function(){
        console.log('install running');
      },
      init
    )
  },
  install: install,
  lookup: lookup_self
}

