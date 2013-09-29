var owfs = require('owfs'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');;




var Owfs = module.exports = function (options) {
  this.options = options;
  this.client = new owfs.Client(options.host, options.port);
}

util.inherits(Owfs, EventEmitter);

Owfs.prototype.init = function() {
  console.log('owfs \tis reading    ' )
  var self = this;
  setInterval(function(){
    self.readDevices();
  }, this.options.interval);
};



Owfs.prototype.readDevices = function () {
  var self = this;
  try{
    self.client.dirall("/", function(nodes){      
      nodes.forEach(function(nod){
        readDevice(nod);
      }); 
    });
  }
  catch (e) {
    console.error(e);
  }
}


Owfs.prototype.readDevice = function (nod) {
  var self = this;
  //console.log("processing", nod);
  try{
    self.client.dir(nod, function(values){
      values.forEach(function(value){
        value = value.replace(nod, '');
        //console.log(value);
        if(valid_keys.indexOf(value)>=0){
          readValue(nod, value);
        }
      });
    });
  }
  catch (e) {
    console.error(e);
  }

}


Owfs.prototype.readValue = function (device, property) {
  var dpkey = device + property;
 // device = device.replace('/', '');
  //property = property.replace('/', '');
  var topic = config.topic.prefix + dpkey;
  //check for alias
  if(deviceinfo.hasOwnProperty(dpkey)){
    if(deviceinfo[dpkey].hasOwnProperty('alias')){
      topic = deviceinfo[dpkey].alias;
    }
  }
  else{
    deviceinfo[dpkey]={alias: config.topic.prefix + dpkey};
    mq.set(dpkey, 'alias', config.topic.prefix + dpkey);
  }
  //if access to default if missing
  if(! deviceinfo[dpkey].hasOwnProperty('access')){
    mq.set(dpkey,  'access', 'r'); //default to read-only
    deviceinfo[dpkey].access = 'r';
  }
    
  topic='/raw/' + topic;
  //console.log("reading", dpkey);
  self.client.read(dpkey, function(result){
    log.debug(topic, result);
    mq.publish(topic, result);
  });
}