var colors = require('colors/safe');

module.exports = function(types){

  colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
  });

  function get_date(){
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  }

  return function(message, type){
    if(!types || !types.length || types.indexOf(type) !== -1){
      console.log('[%s] (%s): %s', colors.blue(get_date()), type, message);
    }
  };
}
