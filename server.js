

var http = require('http'),
  url = require('url'),
  fs = require('fs'),
  path = require("path");

var lib = require('./lib');

var routes = {
  '/values': function(req, res){
    res.writeHeader(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(lib.owfs.cache));
  }
}

function router(req, res){
  var urlpath = url.parse(req.url).pathname;
  if (routes.hasOwnProperty(urlpath)) {
    var route = routes[urlpath];
    var type = typeof route;
    console.log("urlpath=%s, route=%s", urlpath, type);
    if (type === 'function') {
      route(req, res);
    }
    else if (type === 'undefined') {
      status404(urlpath);  
    }
    
  }
  else {
    console.log('last="%s"', urlpath[urlpath.length - 1]);
    var fullpath = urlpath[urlpath.length - 1] === '/' ? urlpath + 'index.html' : urlpath;
    fullpath = './views' + fullpath;
    fs.exists(fullpath, function(exists){
      if (exists) {
        return sendFile(fullpath);
      }
      else {
        return status404(fullpath);
      }
    });
  }

  function sendFile(fullpath) {
    console.log("sending %s", fullpath);
    fs.readFile(fullpath, "binary", function (err, file) {
      if (err) {
        return status500(err);
      }
      else {
        res.writeHeader(200);    
        res.write(file, "binary");    
        res.end();  
      }
    });
  }


  function status500(err) {
    res.writeHeader(500, {"Content-Type": "text/plain"});    
    res.write(err + "\n");    
    res.end();    
  }

  function status404(data) {
    res.writeHeader(404, {"Content-Type": "text/plain"});    
    res.write("404 Not Found\n");    
    if(data) {
      res.write(data);
    }
    res.end();  
  }
}

var server = http.createServer(function (req, res) {
  router(req, res);
});

server.listen(lib.config.get('PORT'), function(){
  console.log('http \tlistening on', lib.config.get('PORT'));
});