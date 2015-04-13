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

var N3 = require('n3');
var fs = require('fs');

var startTime = new Date();

var fileWriteStream = fs.createWriteStream('./default.xml');
var writer = N3.Writer(fileWriteStream, { prefixes: { 'contact': 'http://example.org/category/contact#' } });
writer.addTriple('http://example.org/category#Contact',
  'http://www.w3.org/category#type',
  'http://example.org/contact#Contact');

for (var i = 0; i < 30000; i++){
  var currentTime = (new Date());
  var fullName = "FullName" + i;
  var fullNameUrl = 'http://example.org/category/contact#' + fullName;

  writer.addTriple('http://example.org/category#Contact',
    'http://example.org/category/contact#Person',
    fullNameUrl);
  
  writer.addTriple(fullNameUrl,
    'http://www.w3.org/contact#type',
    'http://example.org/category/contact#Person');
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#FN',
    object:    "FN"+i
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#name',
    object:    "Name" + i
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#sex',
    object:    "sex"
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#Email',
    object:    "EmailAddr"
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#Phone',
    object:    "phoneNum"
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#createTime',
    object:    currentTime
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#lastModifyTime',
    object:    currentTime
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#lastAccessTime',
    object:    currentTime
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#createDev',
    object:    "deviceId"
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#lastModifyDev',
    object:    "deviceId"
  });
  writer.addTriple({
    subject:   fullNameUrl,
    predicate: 'http://example.org/category/contact#lastAccessDev',
    object:    "deviceId"
  });

  
}

writer.end();

fileWriteStream.on('finish', function(){

  var endTime = new Date();
  console.log("----------------end _________________");
  var timeSpan = endTime.getTime() - startTime.getTime();
  console.log("\nThe time span is: " + timeSpan);
});



