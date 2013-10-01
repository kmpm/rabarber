var hq = require('hyperquest');
var qs = require('querystring');
var concat = require('concat-stream')
var Q = require('q');




exports.Get = function(url, options) {
  var deferred = Q.defer();
	
  var req = hq(url);
  
  req.pipe(concat(function (data) {
    console.log('data=' + data);
    deferred.resolve(data);
  }));

  return deferred.promise;
}