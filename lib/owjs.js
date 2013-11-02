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
  this.index=0;
  this.families=[10,28];
};

util.inherits(Owjs, EventEmitter);

Owjs.prototype.init = function() {
  var self = this;
  log.info("owjs \treading every %s second(s) from %s", self.opts.interval / 1000, self.opts.host);
  setInterval(function(){
    self.getFamily();  
  }, self.opts.interval);
};


Owjs.prototype.getFamily = function () {
  var self = this;
  var family = self.families[self.index];
  self.index+=1;
  if(self.index > self.families.length-1) {
    self.index=0;
  }
  log.debug("reading family", family);
  self.client.readFamily(family, 'temperature')
  .then(function(result){
    log.debug('got %s devices', result.length);
    return self.temperatures(result);
  })
  .catch(function(err){
    log.error(err);
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