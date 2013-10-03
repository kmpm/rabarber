var easyip = require('easyip'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');




var Fst = module.exports = function(){
  var service = new easyip.Service();
  this.service = service;

  service.on('listening', function(address) {
    console.log('easyip \tis listening on port', address.port);
  });

};

util.inherits(Fst, EventEmitter);


Fst.prototype.init = function() {
  var self = this;
  self.service.bind();

  

  /*this.service.storage.on('changed', function(operand, index, prev, now){
    this.emit('changed', operand, index, prev, now);
  });*/
};


Fst.prototype.set = function(address, value) {
  this.service.storage.set(easyip.OPERANDS.FLAGWORD, address , value);
};


