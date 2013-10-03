var owjs = require('owjs'),
  extend = require('xtend'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');

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
  console.log("owjs \treading every %s second(s) from %s", self.opts.interval / 1000, self.opts.host);
  setInterval(function(){
    self.client.readFamily(10, 'temperature')
    .then(function(result){
      self.temperatures(result);
    })
    .catch(function(err){
      console.error(err);
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
      self.emit('changed', entry.path, nv);
      self.cache[entry.path] = nv;
    }
  });
};