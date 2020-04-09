var express = require('express')
  , app = express()
  , path = require('path')
  , fs = require('fs');

var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');

var pkg = require('./package.json')
  , lib = require('./lib')
  , log = require('./lib/log').addContext('app');

var exec = require('child_process').exec;



app.set('port', lib.config.get('PORT'));
app.set('views', path.join(__dirname, 'frontend', 'views'));
app.set('view engine', 'jade');
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
// app.use(app.router);

// development only
if ('development' === app.get('env')) {
  log.info('running in development mode');
  app.use(errorhandler());
  var browserify = require('browserify-middleware');
  browserify.settings({
    transform: ['pugify']
  });
  app.use('/rabarber.js', browserify('./src/main.js'));
}

app.get('/pkg',  function (req, res) {
  res.json(pkg);
});

app.get('/values',  function (req, res) {
  if(req.accepts('html')){
    log.debug('sending string');
    res.setHeader('Content-Disposition', 'inline; filename="values.json"');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(lib.mapping.map, null, 2));
  }
  else {
    res.setHeader('Content-Type', 'application/json');
    res.json(lib.mapping.map);
  }
});

app.post('/values', function (req, res) {
  //console.log(req.files);
  fs.readFile(req.files.mapping.path, function (err, data) {
    lib.upload(data);
    res.redirect('/');
    // var newPath = __dirname + "/uploads/uploadedFileName";
    // fs.writeFile(newPath, data, function (err) {
    //   res.redirect("back");
    // });
  });
  
});

app.get('/save', function(req, res){
  log.info('save');
  lib.mapping.save();
  res.redirect('/');
});

app.get('/reboot', function(req, res) {
  log.info('reboot');
  exec('sudo reboot');
  res.redirect('/');
});

app.get('/poweroff', function(req, res) {
  log.info('poweroff');
  exec('sudo poweroff');
  res.redirect('/');
});

app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use(express.static(path.join(__dirname, 'frontend', 'static')));


module.exports = app;