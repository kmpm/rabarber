var nconf = require('nconf');

var Fst = require('./fst')
  , Owfs = require('./owjs')
  , Mapping = require('./mapping');



var SAVE_INTERVAL = 10000;
var SAVE_MAX = 60000 * 60 * 12; //12h max



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

lib.owfs.on('changed', function(path, value){
  var map = lib.mapping.addPath(path);
  var address = lib.fstBase + map.index;
  var fValue = parseFloat(value);
  if (fValue !== map.value) {
    //console.log("%s !== %J", fValue, map.value);
    map.value = fValue;
    if (lib.savetimer === null) {
      lib.savetimer = setTimeout(saving, SAVE_INTERVAL);
    }
    var fstValue = fValue * 10;
    //console.log("path=%s, value=%s, address=%s, fstValue=%s", path, value, address, fstValue);
    lib.fst.set(address, fstValue);
  }
  
});



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