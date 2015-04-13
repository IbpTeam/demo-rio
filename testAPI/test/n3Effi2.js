/**
 * @Copyright:
 * 
 * @Description: test n3.
 *
 * @author: Yuanzhe
 *
 * @Data:2015.4.09
 *
 * @version:0.1
 **/

var fs = require('fs');

var startTime = new Date();
var fileWriteStream = fs.createWriteStream('./default.xml');
var strBuf = '<http://example.org/category#Contact>'+
  '<http://www.w3.org/category#type>'+
  '<http://example.org/contact#Contact>'+'\n';

for (var i = 0; i < 300000; i++){
  var currentTime = (new Date());
  var fullName = "FullName" + i;
  var fullNameUrl = '<http://example.org/category/contact#' + fullName+'>';

  strBuf += '<http://example.org/category#Contact>'+
    '<http://example.org/category/contact#Person>'+
    fullNameUrl+'\n';
  
  strBuf += fullNameUrl+
    'http://www.w3.org/contact#type'+
    'http://example.org/category/contact#Person'+'\n';
  strBuf += fullNameUrl+ 'http://example.org/category/contact#FN'+"FN"+i+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#name'+"Name" + i+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#sex'+"sex"+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#Email'+"EmailAddr"+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#Phone'+"phoneNum"+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#createTime'+currentTime+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#lastModifyTime'+currentTime+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#lastAccessTime'+currentTime+'\n';
  strBuf += fullNameUrl+'http://example.org/category/contact#createDev'+"deviceId\n";
  strBuf += fullNameUrl+'http://example.org/category/contact#lastModifyDev'+"deviceId\n";
  strBuf += fullNameUrl+'http://example.org/category/contact#lastAccessDev'+"deviceId\n";

  //console.log(strBuf);
  fileWriteStream.write(strBuf);

  var strBuf = '\n';
}

fileWriteStream.end();

fileWriteStream.on('finish', function(){

  var endTime = new Date();
  console.log("----------------end _________________");
  var timeSpan = endTime.getTime() - startTime.getTime();
  console.log("\nThe time span is: " + timeSpan);
});