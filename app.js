var express = require('express')
  , app = express()
  , path = require('path')
  , fs = require('fs');

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
  if(req.accepts('html')){
    console.log('sending string');
    res.setHeader('Content-Type', 'text/plain');
    res.send(JSON.stringify(lib.mapping.map, null, 2));
  }
  else {
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
  lib.mapping.save();
  res.redirect('/');
});

app.use(express.static(path.join(__dirname, 'frontend', 'public')));
app.use(express.static(path.join(__dirname, 'frontend', 'static')));


module.exports = app;