var owjs = require('../vendor/owjs'),
  extend = require('xtend'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  log = require('./log'),
  log = log.addContext('owfs');

var F_DS1820 = 10;
var F_DS2450 = 20;
var F_DS2438 = 26;
var F_DS1920= 28;



var Owjs = module.exports = function (options) {
  this.cache = {};
  this.opts = extend(
    {
      interval:10000
    }
    , options);

  this.client = new owjs.Client(this.opts);
  this.index=0;
  this.families=[F_DS1820, F_DS2450 ,F_DS2438, F_DS1920];
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
  self.index += 1;
  if(self.index > self.families.length - 1) {
    self.index = 0;
  }
  log.debug("reading family", family);
  var p;
  switch (family) {

    case F_DS1820:
    case F_DS1920:
      p = self.client.readFamily(family, 'temperature')
      .then(function(result){
        log.info('got %s devices in family ', result.length, family);
        return self.temperatures(result);
      });
      break;

    case F_DS2450:
      p = self.client.readFamily(family, 'volt.ALL')
      .then(function (result) {
        return self.voltages(result);
      });
      break;

    case F_DS2438:
      p = self.client.readFamily(family, 'humidity')
      .then(function (result) {
        self.humidity(result);
        return self.client.readFamily(family, 'temperature');
      })
      .then(function (result) {
        return self.temperatures(result);
      });
      break;
    default:
      return;
  }

  p.catch(function(err){
    log.error(err);
  });
};

Owjs.prototype.voltages = function (data) {
  var extra = [];
  var char = 65;
  data.forEach(function (entry) {
    log.debug(entry.path, entry.value);
    var s = entry.value.split(',');
    s.forEach(function (value) {
      var e = extend(entry, {
        path: entry.path.replace('ALL', String.fromCharCode(char++)),
        value: parseFloat(value)
      });
      extra.push(e);
    });
    //var nv = parseFloat(entry.value).toFixed(3);
    //entry.value = nv;
  });


  return this.values(extra);
};


Owjs.prototype.temperatures = function(data) {
  data.forEach(function (entry) {
    entry.value = parseFloat(entry.value).toFixed(1);
  });
  return this.values(data);

};

Owjs.prototype.humidity = function (data) {
  data.forEach(function (entry) {
    entry.value = parseFloat(entry.value).toFixed(2);
  });
  return this.values(data);
};

Owjs.prototype.values = function(data) {
  var self = this;
  var changed=[];
  log.debug("reading", data);
  data.forEach(function(entry){
    var pv,
      nv = entry.value;

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

