var easyip = require('easyip'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');




var Fst = module.exports = function(options){
  this.service = new easyip.Service();
};

util.inherits(Fst, EventEmitter);


Fst.prototype.init = function() {
  this.service.bind();

  this.service.on('listening', function(){
    console.log('easyip \tis listening');
  });

  /*this.service.storage.on('changed', function(operand, index, prev, now){
    this.emit('changed', operand, index, prev, now);
  });*/
};


Fst.prototype.set = function(address, value) {
  this.service.storage.set(easyip.OPERANDS.FLAGWORD, address , value);
};


