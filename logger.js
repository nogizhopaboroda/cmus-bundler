module.exports = function(types){

  function get_date(){
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
  }

  return function(message, type){
    if(!types || !types.length || types.indexOf(type) !== -1){
      console.log('[%s] (%s): %s', get_date(), type, message);
    }
  };
}
