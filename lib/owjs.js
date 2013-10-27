var owjs = require('owjs'),
  extend = require('xtend'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  log = require('./log'),
  log = log.addContext('owfs');

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
    self.client.readFamily(10, 'temperature')
    .then(function(result){
      log.debug('got %s devices', result.length);
      self.temperatures(result);
    })
    .catch(function(err){
      log.err(err);
    });
  }, self.opts.interval);
};


Owjs.prototype.temperatures = function(data) {
  var self = this;
  data.forEach(function(entry){
    var pv, 
      nv = parseFloat(entry.value).toFixed(1);

    if(self.cache.hasOwnProperty(entry.path)){
      pv = self.cache[entry.path];
    }

    if (pv !== nv) {
      self.cache[entry.path] = nv;
      self.emit('changed', entry.path, nv);
    }
    self.emit('read', entry.path, nv);
  });
};