var http = require('http')

var lib = require('./lib'),
  Router = require('./lib/router');

var routes = {
  '/values': function(req, res){
    res.writeHeader(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(lib.owfs.cache));
  }
}

var router = new Router(routes);


var server = http.createServer(function (req, res) {
  router(req, res);
});

module.exports = server;