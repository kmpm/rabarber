var easyip = require('easyip'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  log = require('./log').addContext('fst');




var Fst = module.exports = function(options){
  var service = new easyip.Service();
  this.service = service;
  this.opts=options;

  service.on('listening', function(address) {
    log.info('easyip \tis listening on port', address.port);
  });

};

util.inherits(Fst, EventEmitter);


Fst.prototype.init = function() {
  var self = this;
  self.service.bind(this.opts.port);

  

  /*this.service.storage.on('changed', function(operand, index, prev, now){
    this.emit('changed', operand, index, prev, now);
  });*/
};


Fst.prototype.set = function(address, value) {
  this.service.storage.set(easyip.OPERANDS.FLAGWORD, address , value);
};


