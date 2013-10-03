var hq = require('hyperquest'),
  // qs = require('querystring'),
  concat = require('concat-stream'),
  Q = require('q');




exports.Get = function (url, options) {
  this.opts = options;
  var deferred = Q.defer();
	
  var req = hq(url);
  
  req.pipe(concat(function (data) {
    //console.log('data=' + data);
    deferred.resolve(data);
  }));

  return deferred.promise;
};