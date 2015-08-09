var dnode = require('dnode');
var spawn = require('child_process').spawn;
var fs = require('fs');


var HOME_DIR = process.env.HOME || process.env.USERPROFILE;
var CMUS_DIR = HOME_DIR + '/.cmus';
var THEMES_DIR = CMUS_DIR + '/themes';
var PLUGINS_DIR = CMUS_DIR + '/plugins';
var DIRS = {
  'plugin': PLUGINS_DIR,
  'theme': THEMES_DIR,
};


var state = {
  "variables": {},
  "status_programs": []
};

  
var cmus_remote = spawn('cmus-remote', []);

var queue = [];

cmus_remote.stdout.on('data', function (data) {
  console.log('stdout: ' + data);
});

cmus_remote.stderr.on('data', function (data) {
  console.log('stderr: ' + data);
  process.exit(0);
});

cmus_remote.on('close', function (code) {
  console.log('child process exited with code ' + code);
  process.exit(0);
});

setInterval(function(){
  cmus_remote.stdin.write('\n');
}, 1000);

console.log('\ndaemon started');

function on_message(message, cb){

    switch(message[0]){
      case "set":
        console.log('setting variable %s: %s', message[1], message[2]);
        state.variables[message[1]] = message[2];
        cb('ok');
        break;
      case "get":
        cb(state);
        break;
      case "plugin":
      case "theme":
        console.log('installing %s: %s', message[0], message[1]);
        install_plugin(message[0], message[1]);
        cb('ok');
        break;
      case "status_program":
        console.log('setting status program: %s, arguments: ', message[1], message.slice(2));
        state.status_programs.push(message[1]);
        cb('ok');
        break;
      case "status":
        console.log('got status: ', message);

        state.status_programs.forEach(function(status_program){
          var execFile = require('child_process').execFile;
          execFile(PLUGINS_DIR + '/' + status_program, message, function(error, stdout, stderr) {
            console.log("got from status program: " + stdout);
          });
        })
      
        break;
      default:
        console.log('unrecognised command: ', message.join(' '));
        queue.push(message.join(' '));
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
  console.log(link + ' -> ' + target_dir);
  run_cmd("git", ["clone", "git@github.com:" + link + ".git", target_dir], function(){
    console.log(link + ' installed');
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
    console.log(type + ': ' + link + ' already installed');
  } else {
    console.log(type + ': ' + parts[0] + ' ');
    clone_repo(link, target_dir, function(){
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
