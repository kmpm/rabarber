var nconf = require('nconf');

var Fst = require('./fst')
  , Owfs = require('./owjs')
  , Mapping = require('./mapping');

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
    base:100
  },
  mapping:{
    load: false
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
  
  var map = lib.mapping.add(path);
  var address = lib.fstBase + map.index;
  var fValue = parseFloat(value);
  if (fValue !== map.value) {
    map.value = fValue;
    if(lib.savetimer === null) {
      lib.savetimer = setTimeout(saving, 10000);
    }
    
  }
  var fstValue = fValue * 10;
  //console.log("path=%s, value=%s, address=%s, fstValue=%s", path, value, address, fstValue);
  lib.fst.set(address, fstValue);
});

function saving(){
  lib.mapping.save();
  lib.savetimer=null;
}