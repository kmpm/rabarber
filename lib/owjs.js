var owjs = require('owjs'),
  extend = require('xtend'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  log = require('./log'),
  log = log.addContext('owfs')
  Q = require('q');


var Owjs = module.exports = function (options) {
  this.cache = {};
  this.opts = extend(
    {
      interval:10000
    }
    , options);
    
  this.client = new owjs.Client(this.opts);
};

util.inherits(Owjs, EventEmitter);

Owjs.prototype.init = function() {
  var self = this;
  log.info("owjs \treading every %s second(s) from %s", self.opts.interval / 1000, self.opts.host);
  setInterval(function(){
    var funcs = [self.getFamily(10), self.getFamily(28)];
    var result = Q([]);
    funcs.forEach(function(f){
      result = result.then(f);
    });
    
  }, self.opts.interval);
};


Owjs.prototype.getFamily = function (family) {
  var self = this;
  return self.client.readFamily(family, 'temperature')
  .then(function(result){
    log.debug('got %s devices', result.length);
    return self.temperatures(result);
  });
}


Owjs.prototype.temperatures = function(data) {
  var self = this;
  var changed=[];
  log.debug("reading", data);
  data.forEach(function(entry){
    var pv, 
      nv = parseFloat(entry.value).toFixed(1);

    if(self.cache.hasOwnProperty(entry.path)){
      pv = self.cache[entry.path];
    }

    if (pv !== nv) {
      self.cache[entry.path] = nv;
      changed.push(entry.path);
      self.emit('changed', entry.path, nv);
    }
    self.emit('read', entry.path, nv);
  });
  return changed;

};