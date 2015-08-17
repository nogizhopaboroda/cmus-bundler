var spawn = require('child_process').spawn;
var fs = require('fs');
var exec_async = require('child_process').exec;
var execFile = require('child_process').execFile;

var logger = require('./logger')(process.argv[3] === 'debug' ? process.argv.slice(4) : ['info']);

var HOME_DIR = process.env.HOME || process.env.USERPROFILE;
var CMUS_DIR = HOME_DIR + '/.cmus';
var THEMES_DIR = CMUS_DIR + '/themes';
var PLUGINS_DIR = CMUS_DIR + '/plugins';
var DIRS = {
  'plugin': PLUGINS_DIR,
  'theme': THEMES_DIR,
};

var children = [];
var state = {
  "variables": {},
  "status_programs": [],
  "queue": []
};

  
var cmus_remote = spawn('cmus-remote', []);

cmus_remote.stdout.on('data', function (data) {
  logger('stdout: ' + data, 'stdout');
});

cmus_remote.stderr.on('data', function (data) {
  logger('stderr: ' + data, 'warning');
  logger('graceful death', 'info');

  children.forEach(function(child){
    child.kill();
  });

  process.exit(0);
});

cmus_remote.on('close', function (code) {
  logger('child process exited with code ' + code, 'info');
  process.exit(0);
});

setInterval(function(){
  cmus_remote.stdin.write('\n');
}, 1000);

logger('\ndaemon started', 'info');

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
        install_plugin(message[0], message[1], message.slice(2));
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

function clone_repo(link, target_dir, cbk){
  logger(link + ' -> ' + target_dir, 'plugin');
  run_plugin(["cmd", "git clone git@github.com:" + link + ".git " + target_dir], {}, function(){
    cbk && cbk();
  });
}

function install_plugin(type, link, postinstall){
  var parts = link.split('#');
  var target_dir = 
    DIRS[type] +
    "/" +
    parts[0].split('/')[1];

  fs.exists(target_dir, function(exists){
    if(exists){
      logger(type + ': ' + link + ' already installed', type);
    } else {
      clone_repo(link, target_dir, function(){
        logger(link + ' installed', 'plugin');
        cmus_remote.stdin.write('echo ' + type + ' ' + link + ' installed\n');
        if(postinstall.length > 0){
          run_plugin(
            postinstall,
            {cwd: target_dir},
            function(stdout){
              logger('after install plugin ' + link + ' got: ' + stdout, 'plugin');
            },
            function(error_message){
              logger('target_dir: ' + target_dir, 'plugin');
              logger('after install plugin ' + link + ' failed with: ' + error_message, 'plugin');
            }
          );
        }
      });
    }
  });
}


function run(){
  var net = require('net');
  var server = net.createServer({allowHalfOpen: true}, function(c) { //'connection' listener
    console.log('client connected');
    c.on('data', function(data) {
      //console.log('client send data', JSON.parse(data));

      setImmediate(function(){
        on_message(JSON.parse(data), function(resp){
          setImmediate(function(){
            c.write(JSON.stringify(resp) + '\n');
          });
        });
      });

    });
    c.on('end', function() {
      //console.log('client disconnected');
    });
  });
  server.listen(__dirname + '/socket.sock', function() { //'listening' listener
    console.log('\n\nserver bound');
  });
}


var fs = require('fs');

fs.exists(__dirname + '/socket.sock', function(exists) {
  if (exists) {
    // serve file
    fs.unlink(__dirname + '/socket.sock', function(){ run(); })
  } else {
    run();
  }
});

