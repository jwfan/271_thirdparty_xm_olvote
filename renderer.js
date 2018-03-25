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
   fs.readFile(file.path,'utf8',function(err,data){
     holder.textContent = data;
   });
   return false;
 };
