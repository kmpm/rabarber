var extend = require('xtend')
  , slug = require('slug');
var fs = require('fs');

slug.charmap['.'] = 'dot';

function keyme (key) {
  return slug('key' + key);
}


var Mapping = module.exports = function (options) {
  var self = this;
  this.opts = extend({
    file: 'mapping.json',
    load: true
  }, options);
  this.keycount=0;
  this.map = {};
  if(this.opts.load && this.opts.file !== null && fs.existsSync(this.opts.file)){
    console.log('loading map');
    this.map = JSON.parse(fs.readFileSync(this.opts.file));
  }

  process.on( 'SIGINT', function() {
    console.log( "\nGracefully saving because of SIGINT (Ctrl-C)" );
    // some other closing procedures go here
    self.save();
    
  });

  process.on('exit', function(){ self.save(); });
};


Mapping.prototype.retrieve = function (key) {
  var slug = keyme(key);
  if (this.exists(slug)) {
    return this.map[slug];
  }
};


Mapping.prototype.exists = function (key) {
  return this.map.hasOwnProperty(keyme(key));
};


Mapping.prototype.add = function (key) {
  var slug = keyme(key);
  if (this.exists(slug)) {
    return this.retrieve(slug);
  }
  else {
    var value = {device:key, index: this.keycount++, alias:key, value:0};
    this.map[slug] = value;
    return this.map[slug];
  }
};


Mapping.prototype.save = function() {
  console.log("saving to", this.opts.file);
  var data = JSON.stringify(this.map, null, 4);
  fs.writeFile(this.opts.file, data);
};
