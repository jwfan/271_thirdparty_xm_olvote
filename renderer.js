// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');
var holder = document.getElementById('holder');
holder.ondragover = function () {
   return false;
};
holder.ondragleave = holder.ondragend = function () {
 return false;
};

holder.ondrop = function (e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  var lineReader = require('readline').createInterface({
   input: require('fs').createReadStream(file.path)
  });
  lineReader.on('line', function (line) {
    vote(preprocess(line));
  });
  return false;
};


function preprocess(line){
  return {username: line.split(' ')[0].split('.')[1], password: line.split(' ')[1]};
}

function vote(data){
  var un = data.username;
  var pw = data.password;
  var request = require('request');
  request.post({url:'https://account.xiaomi.com/pass/serviceLoginAuth2?_dc=' + (new Date).getTime(), form: {user: '+86' + un, hash: hash(pw)}}, function(err,httpResponse,body){
    console.log(err);
    console.log(httpResponse);
    if (httpResponse == 302)
      console.log(body);
  });
}

function hash(pw){
  return pw;
}
