var readline = require('readline');
var colors = require("colors/safe");
var spawn = require("child_process").spawn;
var Socket = require("./socket");
var Server = Socket.Server;

function install(){

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function hide_cursor(){
    rl.write('\033[?25l');
  }

  function show_cursor(){
    rl.write('\033[?25h');
  }

  var old_lines = [];
  function update_text(lines){
    hide_cursor();

    readline.moveCursor(rl, 0, -old_lines.length);
    old_lines = lines;
    rl.write('\r');
    readline.clearScreenDown(rl);

    rl.write(lines.join('\n'));

    show_cursor();
  }

  var spinner = ['◜', '◠', '◝', '◞', '◡', '◟'];

  var cmus = spawn("cmus", []);

  cmus.stdout.on("data", function (data) { cmus.kill(); }); 
  cmus.stderr.on("data", function (data) { cmus.kill(); });
  cmus.on("close", function (code) {});

  var install_queue = {};

  var i = 0;
  update_text(get_install_message());

  setInterval(function(){
    update_text(get_install_message());
    i++;
  }, 100);

  function get_install_message(){
    if(Object.keys(install_queue).length === 0){
      return ['waiting for clients ' + colors.cyan(spinner[i % spinner.length])];
    }
    var _lines = [colors.yellow('install clients connected')];

    for(var key in install_queue){
      var item = install_queue[key];
      if(item){
        _lines.push('installing ' + colors.magenta(key) + colors.green(' installed'));
      } else {
        _lines.push('installing ' + colors.magenta(key) + ' ' + colors.cyan(spinner[i % spinner.length]));
      }
    }

    return _lines;
  }


  Server()
    .then(function(message, cb){
      if(message[0] === "theme" || message[0] === "plugin"){
        update_text(get_install_message());
        if(message[2] === "ok"){
          setTimeout(function(){
            install_queue[message[1]] = true;

            var need_exit = true;
            for(var key in install_queue){
              if(install_queue[key] === false){
                need_exit = false;
                break;
              }
            }
            if(need_exit){
              update_text(get_install_message());
              rl.write('\n');
              process.exit(0);
            }

            cb("ok");
          }, 100);
        } else {
          install_queue[message[1]] = false;
          cb("ok");
        }
      }
    })
    .run()
}

module.exports = {
  install: install
};
