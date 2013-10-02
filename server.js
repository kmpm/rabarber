
var lib = require('./lib'),
  Pid = new require('./lib/pid'),
  app = require('./app');

var pid = new Pid(lib.config.get('pid'));

app.listen(lib.config.get('PORT'), function(){
  console.log('http \tlistening on port', lib.config.get('PORT'));
  pid.downgrade(function(p, g){
    console.log("Now running as %s:%s", p, g);
  });
});