
var hq = require('hyperquest');
var qs = require('querystring');
var concat = require('concat-stream');



var getValues = function (callback) {
  var req = hq('/values');
  req.pipe(concat(function(data){
    console.log('data=' + data);
    callback(data);
  }));
  
}


function showValues(data) {
  var el = document.querySelector('.content')
  el.innerHTML = data;
}

setInterval(function(){
  getValues(showValues);
}, 5000);
getValues(showValues);





/*
var req = hq.post('/form');
req.pipe(concat(function (err, data) {
    console.log('data=' + data);
}));
req.end(qs.stringify({ name: 'John', time: '2pm' }));
*/