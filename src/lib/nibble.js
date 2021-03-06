var hq = require('hyperquest'),
  // qs = require('querystring'),
  concat = require('concat-stream'),
  Q = require('q');




exports.Get = function (url, options) {
  this.opts = options;
  var deferred = Q.defer();
	
  var req = hq(url);
  req.setHeader('Accept', 'application/json;');
  
  req.pipe(concat({encoding:"string"}, function (data) {
    //console.log('data=' + data);
    deferred.resolve(data);
  }));

  return deferred.promise;
};