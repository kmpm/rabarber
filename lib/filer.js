var Q = require('q'),
  fs = require('fs'),
  path = require('path');


var mimetypes = require('./mimetypes.json');

exports.exists = function (fullpath) {
  var deferred = Q.defer();
  fs.exists(fullpath, function(exists){
    if (exists) {
      deferred.resolve(fullpath);
    }
    else {
      deferred.reject(new Error('File is missing'));
    }
  });

  return deferred.promise;

}


exports.mime = function(fullpath) {
  return Q.fcall(function(){
    var ext = path.extname(fullpath);
    if (mimetypes.hasOwnProperty(ext)) {
      return mimetypes[ext];
    }
    else {
      return 'text/plain';
    }
  })
};

exports.readFile = Q.denodeify(fs.readFile);