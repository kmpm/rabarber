var extend = require('xtend'),
  fs = require('fs');

var slug = require('slug');

var log = require('./log');
log = log.addContext('mapping');
console.log('context', log.context);
slug.charmap['.'] = 'DOT_';
slug.charmap['/'] = 'SLASH_';

function slugKey (key) {
  return slug('key_' + key).toString();
}


var Mapping = module.exports = function (options) {
  // var self = this;
  this.opts = extend({
    file: 'mapping.json',
    load: true
  }, options);
  this.keycount=0;
  this.map = [];
  if(this.opts.load && this.opts.file !== null && fs.existsSync(this.opts.file)){
    log.info('loading map');
    this.map = JSON.parse(fs.readFileSync(this.opts.file));
  }

  // process.on( 'SIGINT', function() {
  //   console.log.debug( "\nGracefully saving because of SIGINT (Ctrl-C)" );
  //   // some other closing procedures go here
  //   self.save();
  //   process.exit();
  // });

  // process.on('exit', function(){ self.save(); });
};


Mapping.prototype.retrieve = function (slug) {
  var pos = this.indexOf(slug);
  if (pos >=0) {
    return this.map[pos];
  }
  else{
    return null;
  }
};

Mapping.prototype.indexOf = function (slug) {
  return this.map.map(function(e) { return e.slug; }).indexOf(slug);
};

Mapping.prototype.exists = function (slug) {
  return this.indexOf(slug)>=0;
};


Mapping.prototype.addPath = function (path) {
  var slug = slugKey(path);
  var pos = this.indexOf(slug);

  if (pos >= 0) {
    //log.debug("existing device", slug);
    return this.map[pos];
  }
  else {
    var keycount = this.getMax()+1;
    var value = {slug:slug, device:path, index: keycount, alias:path, value:0, lastChange:new Date(), lastRead:new Date()};
    this.map.push(value);
    //log.debug("new device", value);
    return value;
  }
};

Mapping.prototype.getMax = function() {
  var i, m, max=0;
  for(i=0; i < this.map.length; i++){
    m = this.map[i];
    //console.log.debug("max=", m.index);
    if(m.index>max) {
      max = m.index;
    }
  }
  return max;
};


Mapping.prototype.sort = function(property){
  property = property || 'index';
  //sort it
  this.map.sort(function(a, b){
    return a[property] - b[property];
  });
};

Mapping.prototype.save = function() {
  log.info("save sorted map to", this.opts.file);
  this.sort();
  var data = JSON.stringify(this.map, null, 4);
  fs.writeFile(this.opts.file, data);
};

