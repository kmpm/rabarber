


var app = require('../app');

var request = require('supertest')(app);

describe('app should', function(){

  it('support index', function(done){
    request.get('/')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect(/Hello World/, done);

  });

  it('return values', function(done){
    request.get('/values')
      .expect('Content-Type', /json/)

      .expect(200, done);
  });


});