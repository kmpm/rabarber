
var lib = require('./lib');
var app = require('./app');

app.listen(lib.config.get('PORT'), function(){
  console.log('http \tlistening on', lib.config.get('PORT'));
});