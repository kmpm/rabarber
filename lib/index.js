var nconf = require('nconf');

var Fst = require('./fst')
  , Owfs = require('./owjs');

nconf.argv()
  .env()
  .file({ file: 'config.json' });
  
nconf.defaults({
  'PORT': process.env.PORT || 3000,
  'IP': process.env.IP || '127.0.0.1',
  'owfs': {
    host:'micro.lan',
    port:4304,
    interval:5000
  },
  'fst': {
    base:100
  }
});

var lib = module.exports = {
  config: nconf,
  get: function(key) { return nconf.get(key); },
  fst: new Fst(nconf.get('fst')),
  owfs: new Owfs(nconf.get('owfs')),
  mapping: {},
  counter: 0,
  fstBase: nconf.get('fst:base')
};


lib.fst.init();
lib.owfs.init();

lib.owfs.on('changed', function(path, value){
  
  var index = 0;
  if (lib.mapping.hasOwnProperty(path)) {
    index = lib.mapping[path];
  }
  else {
    index = lib.counter++;
    lib.mapping[path] = index;
  }
  var address = lib.fstBase + index;
  var fstValue = parseFloat(value) * 10;
  console.log("path=%s, value=%s, address=%s, fstValue=%s", path, value, address, fstValue);
  lib.fst.set(lib.fstBase + index, fstValue);
})