
var nibble = require('./lib/nibble');

function getValues(callback) {
  nibble.Get(window.location + 'values')
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
  var template = require('./valuetable-tbody.pug');
  var tb = document.querySelector('#valuetable');

  if (tb.innerHTML === '') {
    tb.innerHTML = template({data: data});
  }
  else{
    data.forEach(function(row){
      var el = document.querySelector('#row_' + row.slug + ' .col_value');
      if (el) {
        el.innerHTML = row.value;
      }
      else {
        var html = generateValueRow(row.slug, row);
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
  var template = require('./valuetable-row.pug');
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