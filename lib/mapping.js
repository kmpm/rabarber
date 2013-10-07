var extend = require('xtend')
  , slug = require('slug');
var fs = require('fs');

slug.charmap['.'] = 'dot';

function keyme (key) {
  return slug('key' + key).toString();
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
    process.exit();
  });

  process.on('exit', function(){ self.save(); });
};


Mapping.prototype.retrieve = function (key) {
  var slug = keyme(key);
  if (this.exists(key)) {
    return this.map[slug];
  }
  else{
    return null;
  }
};


Mapping.prototype.exists = function (key) {
  return this.map.hasOwnProperty(keyme(key));
};


Mapping.prototype.add = function (key) {
  var slug = keyme(key);
  if (this.exists(key)) {
    //console.log("existing", slug);
    return this.retrieve(key);
  }
  else {
    //console.log("new", slug, this.exists(slug), this.map.hasOwnProperty(slug));
    var value = {device:key, index: this.keycount++, alias:key, value:0};
    this.map[slug] = value;
    return value;
  }
};


Mapping.prototype.save = function() {
  console.log("%s saving to", new Date(), this.opts.file);
  var data = JSON.stringify(this.map, null, 4);
  fs.writeFile(this.opts.file, data);
};
