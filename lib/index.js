var nconf = require('nconf');

var Fst = require('./fst')
  , Owfs = require('./owjs')
  , Mapping = require('./mapping');

var VALUE_TIMEOUT=6000;

var SAVE_INTERVAL = 10000;
var SAVE_MAX = 60000 * 60 * 12; //12h max

var timeouts = {};

nconf.argv()
  .env()
  .file({ file: 'config.json' });
  
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
    interval:5000
  },
  fst: {
    base:100,
    port:995
  },
  mapping:{
    load: true
  }
});

var lib = module.exports = {
  config: nconf,
  get: function(key) { return nconf.get(key); },
  fst: new Fst(nconf.get('fst')),
  owfs: new Owfs(nconf.get('owfs')),
  mapping: new Mapping(nconf.get('mapping')),

  fstBase: nconf.get('fst:base'),
  savetimer: null
};


lib.fst.init();
lib.owfs.init();


//updating values happen here
lib.owfs.on('changed', function(path, value){

  var map = lib.mapping.addPath(path);
  var fValue = parseFloat(value);

  if (fValue !== map.value) {
    //console.log("%s !== %J", fValue, map.value);
    setValue(map, fValue);
   
  }
  
});

function setValue(map, newval) {

  //clear timeout if found
  if(timeouts.hasOwnProperty(map.slug) && timeouts[map.slug] !== null){
    clearTimeout(timeouts[map.slug]);
    timeouts[map.slug] = null;
  }

  


  map.value = newval;
  map.lastChange = new Date();
  //just save mapping from time to time
  if (lib.savetimer === null) {
    lib.savetimer = setTimeout(saving, SAVE_INTERVAL);
  }
  
  //festo stuff here
  var fstValue = newval * 10;
  var address = lib.fstBase + map.index;
  lib.fst.set(address, fstValue);

  //add new timeout
  timeouts[map.slug] = setTimeout(function(){
    map.value = 999;
    lib.fst.set(address, 9999);
  }, VALUE_TIMEOUT);

}


lib.upload = function (newmapString) {
  try {
    var map = JSON.parse(newmapString);
    if(!(map instanceof Array)){
      return console.error("new mapping was not array");
    }
    //TODO: validation
    lib.mapping.map = map;
    lib.mapping.save();
  }
  catch(err){
    console.error("error parsing new mapping", err);
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