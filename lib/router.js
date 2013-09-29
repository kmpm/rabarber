
var url = require('url'),
  fs = require('fs'),
  path = require('path'),
  extend = require('xtend'),
  filer = require('./filer');



var Router = module.exports = function (routes, options) {
  var self = this;
  this.routes = routes;

  this.opts = extend(
    {
      views:'./views',
      index: 'index.html'
    },
    options);
  

  return function (req, res){
    var urlpath = url.parse(req.url).pathname;

    if (routes.hasOwnProperty(urlpath)) {
      var route = routes[urlpath];
      var type = typeof route;
      //console.log("urlpath=%s, route=%s", urlpath, type);
      if (type === 'function') {
        route(req, res);
      }
      else if (type === 'undefined') {
        status404(urlpath);  
      }
      
    }
    else {
      var fullpath = urlpath[urlpath.length - 1] === '/' ? urlpath + 'index.html' : urlpath;
      fullpath = './views' + fullpath;

      filer.exists(fullpath)
      .then(filer.mime)
      .then(function(mimetype){
        res.writeHeader(200, {'Content-Type': mimetype});
        return filer.readFile(fullpath);
      })
      .then(function(file){
        res.write(file, 'binary');
        res.end();
      })
      .catch(status500);
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

}

