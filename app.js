var express = require('express')
  , app = express()
  , path = require('path');

var pkg = require('./package.json')
  , lib = require('./lib');



app.set('port', lib.config.get('PORT'));
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
  var browserify = require('browserify-middleware');
  browserify.settings({
    transform: ['simple-jadeify']
  });
  app.use('/rabarber.js', browserify('./src/main.js'));
}

app.get('/pkg',  function (req, res) {
  res.json(pkg);
});

app.get('/values',  function (req, res) {
  res.json(lib.mapping.map);
});

app.use(express.static(path.join(__dirname, 'frontend', 'static')));

module.exports = app;