
var util = require('util');

var active = {
  'DEBUG': process.env.NODE_ENV === 'development',
  'INFO':true,
  'WARN':true,
  'ERROR':true
};


var LEVELS = ['debug', 'info', 'warn', 'error'];


function log(levelname) {
  levelname = levelname.toUpperCase();
  return function() {
    if(!active[levelname]) {
      return;
    }
    var t = new Date();
    var msg = format(arguments);
    msg = format(['%s- %s\t[%s] %s', t, levelname, this.context, msg]);
    if(levelname === 'ERROR'){
      console.error(msg);
    }
    else {
      console.log(msg);
    }
  };
}


function format(obj) {
  var objects = [];
  for(var i=0; i<obj.length; i++){
    objects.push(obj[i]);
  }
  return util.format.apply(util, objects);
}


var Log = function(context){
  context = context || '';
  this.context=context;
};


Log.prototype.addContext = function (name) {
  return new Log(this.context + '/' + name);
};


LEVELS.forEach(function(l){
  Log.prototype[l] = log(l);
});



module.exports = new Log();