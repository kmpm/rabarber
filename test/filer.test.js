
var should = require('should');
var filer = require('../lib/filer');



describe('Filer', function(){

  it('test exists on existing', function(done){
    filer.exists('package.json')
    .then(function(fullpath){
      should.exist(fullpath);
      fullpath.should.equal('package.json');  
      return done(null);
    })
    .catch(done);
  });


  it('test exists on missing', function(done){
    filer.exists('missing.file.json')
    .then(function(stat){
      done(new Error('should not get here'));
    })
    .catch(function(err){
      should.exist(err);
      done();
    });
  });


  it('mime html', function(done){

    filer.mime('index.html')
    .then(function(mimetype){
      mimetype.should.equal('text/html');
      return done();
    })
    .catch(done);
  });

  it('mime js', function(done){
    filer.mime('client.js')
    .then(function(mimetype){
      mimetype.should.equal('text/javascript');
      return done();
    })
    .catch(done);
  });



});