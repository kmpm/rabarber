
var lib = require('./lib'),
  log = require('./lib/log').addContext('server'),
  Pid = new require('./lib/pid'),
  app = require('./app');

var pid = new Pid(lib.config.get('pid'));

app.listen(lib.config.get('PORT'), function () {
  log.info('http listening on port', lib.config.get('PORT'));
  pid.downgrade(function (p, g) {
    log.info("Now running as user %s:%s", p, g);
  });
});

module.exports = app;