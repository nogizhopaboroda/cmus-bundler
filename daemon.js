var dnode = require('dnode');
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

logger('daemon started', 'info');

function on_message(message, cb){

    state.queue.push(message.join(' '));

    switch(message[0]){
      case "set":
        logger('setting variable ' + message[1] + ': ' + message[2], message[0]);
        state.variables[message[1]] = message[2];
        cb('ok');
        break;
      case "get":
        cb(state);
        break;
      case "call":
        var script_name = '';
        if(message[1] === 'cmd'){
          var child_process = exec_async(message.slice(2).join(' '), function(error, stdout, stderr){
            if (error !== null) {
              logger('program failed: ' + error.stack, 'call');
            } else {
              logger('got from program: ' + stdout, 'call');
            }
          });
        } else {
          script_name = PLUGINS_DIR + '/' + message[1];
          var child_process = execFile(script_name, message.slice(2), {cwd: PLUGINS_DIR}, function(error, stdout, stderr){
            if (error !== null) {
              logger('program ' + script_name + ' failed. error:\n' + error.stack + '\n', message[0]);
            } else {
              logger('got from program ' + script_name + ': ' + stdout, message[0]);
            }
          });
        }

        children.push(child_process);
        logger('calling ' + message[1] + '; arguments: ' + message.slice(2).join(', '), message[0]);
        cb('ok');
        break;
      case "plugin":
      case "theme":
        logger('installing ' + message[0] + ': ' + message[1], message[0]);
        install_plugin(message[0], message[1]);
        cb('ok');
        break;
      case "status_program":
        logger('setting status program: ' + message[1] + ', arguments: ' + message.slice(2), message[0]);
        state.status_programs.push(message[1]);
        cb('ok');
        break;
      case "status":
        logger('got status: ' + message.join(' '), message[0]);

        state.status_programs.forEach(function(status_program){
          var execFile = require('child_process').execFile;
          execFile(PLUGINS_DIR + '/' + status_program, message, {env: state.variables}, function(error, stdout, stderr){
            if (error !== null) {
              logger('status program ' + status_program + ' failed. error:\n' + error.stack + '\n', 'plugin');
            } else {
              logger('got from status program ' + status_program + ': ' + stdout, 'plugin');
            }
          });
        });
      
        cb('ok');
        break;
      default:
        logger('unknown command: ' + message.join(' '), 'unknown');
        cb('ok');
    }
}

function run_cmd(cmd, args, callBack ) {
    var child = spawn(cmd, args);
    var resp = "";
 
    child.stdout.on('data', function (buffer) { resp += buffer.toString() });
    child.stdout.on('end', function() { callBack (resp) });
}

function clone_repo(link, target_dir, cbk){
  logger(link + ' -> ' + target_dir, 'plugin');
  run_cmd("git", ["clone", "git@github.com:" + link + ".git", target_dir], function(){
    cbk && cbk();
  });
}

function install_plugin(type, link){
  var parts = link.split('#');
  var target_dir = 
    DIRS[type] +
    "/" +
    parts[0].split('/')[1];

  if(fs.existsSync(target_dir)){
    logger(type + ': ' + link + ' already installed', type);
  } else {
    clone_repo(link, target_dir, function(){
      logger(link + ' installed', 'plugin');
      cmus_remote.stdin.write('echo ' + type + ' ' + link + ' installed\n');
    });
  }
}

var server = dnode({
  message: function (message, cb) {
    on_message(message, cb);
  }
});
server.listen(5004);
