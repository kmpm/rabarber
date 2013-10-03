
var nibble = require('./lib/nibble');

function getValues(callback) {
  nibble.Get('/values')
  .then(function (data) {
    return callback(data);
  })
  .catch(errorHandler);
}

function errorHandler(err){
  console.log("ERROR!!", err);
}

function showValues(data) {
  data = JSON.parse(data);
  var template = require('./valuetable-tbody.jade');
  var tb = document.querySelector('#valuetable');

  if (tb.innerHTML === '') {
    tb.innerHTML = template({data: data});
  }
  else{
    Object.keys(data).forEach(function(key){
      var row = data[key];
      var el = document.querySelector('#row_' + key + ' .col_value');
      if (el) {
        el.innerHTML = row.value;
      }
      else {
        var html = generateValueRow(key, row);
        appendHtml(tb, html);
      }
    });
  }
}

function appendHtml(target, text) {
  var div = document.createElement('table');
  div.innerHTML = text;
  //tr is the first child of tbody
  target.appendChild(div.firstChild.firstChild);
}


function generateValueRow(key, row) {
  var template = require('./valuetable-row.jade');
  return template({entity: row, key: key});
}

function startTimers(){
  console.log("start timers");
  return setInterval(function () {
    getValues(showValues);
  }, 5000);  
}
var timer = null;
getValues(showValues);

window.rabarber = {

  pause:function(){
    clearTimeout(timer);
    timer = null;
    console.log("pause");
  },
  resume:function(){
    if(timer === null){
      timer = startTimers();
      console.log("resume", timer);
    }
  }
};