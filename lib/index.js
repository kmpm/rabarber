var nconf = require('nconf');

var Fst = require('./fst')
  , Owfs = require('./owjs')
  , Mapping = require('./mapping');

var VALUE_TIMEOUT = 60000 * 2;

var SAVE_INTERVAL = 10000;
var SAVE_MAX = 60000 * 60 * 12; //12h max

var log = require('./log');
log = log.addContext('lib');

var timeouts = {};

nconf.argv()
  .env()
  .file({ file: process.env.CONFIGFILE || 'config.json' });

nconf.defaults({
  PORT: process.env.PORT || 3000,
  IP: process.env.IP || '127.0.0.1',
  pid:{
    uid:null,
    pwd:null
  },
  owfs: {
    host:'127.0.0.1',
    port:4304,
    interval:20000
  },
  fst: {
    base:100,
    port:995
  },
  mapping:{
    load: true,
    file: 'mapping.json'
  }
});

var lib = module.exports = {
  config: nconf,
  get: function(key) { return nconf.get(key); },
  fst: new Fst(nconf.get('fst')),
  owfs: new Owfs(nconf.get('owfs')),
  mapping: new Mapping(nconf.get('mapping')),
  log:log,
  fstBase: nconf.get('fst:base'),
  savetimer: null
};


lib.fst.init();
lib.owfs.init();


//updating values happen here
lib.owfs.on('read', function(path, value){
  var map = lib.mapping.addPath(path);
  var fValue = parseFloat(value);

  setValue(map, fValue);


});

function setValue(map, newval) {

  //clear timeout if found
  if(timeouts.hasOwnProperty(map.slug) && timeouts[map.slug] !== null){
    clearTimeout(timeouts[map.slug]);
    timeouts[map.slug] = null;
  }
  map.lastRead = new Date();
  if(map.value !== newval){
    log.debug("%s changed value from %s to %s", map.device, map.value, newval);
    map.value = newval;
    map.lastChange = new Date();
    //just save mapping from time to time
    if (lib.savetimer === null) {
      lib.savetimer = setTimeout(saving, SAVE_INTERVAL);
    }

    //festo stuff here
    var fstValue = newval * 10;
    if (map.device.indexOf('volt')>=0) {
      fstValue = (newval * 10000).toFixed(0);
    }

    var address = lib.fstBase + map.index;
    log.debug('fst %s = %s', address, fstValue);
    lib.fst.set(address, fstValue);
  }
  else {
    log.debug("%s unchanged value ", map.device, newval);
  }

  //add new timeout
  timeouts[map.slug] = setTimeout(function(){
    map.value = 999;
    lib.fst.set(address, 9999);
    log.warn("%s timed out", map.device);
  }, VALUE_TIMEOUT);

}


lib.upload = function (newmapString) {
  try {
    var map = JSON.parse(newmapString);
    if(!(map instanceof Array)){
      return log.error("new mapping was not array");
    }
    //TODO: validation
    lib.mapping.map = map;
    lib.mapping.save();
  }
  catch(err){
    log.error("error parsing new mapping", err);
    return;
  }
};

function saving() {
  lib.mapping.save();
  lib.savetimer=null;
  if (SAVE_INTERVAL < SAVE_MAX) {
    SAVE_INTERVAL = SAVE_INTERVAL * 2;
  }
}
