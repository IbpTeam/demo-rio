var fs = require('fs');
var Converter = require("csvtojson").core.Converter;

function csvTojson(csvPath, callBack){
  var csvFileName = csvPath;
  var csvConverter=new Converter();
  csvConverter.on("end_parsed",function(jsonObj){
    //console.log(JSON.stringify(jsonObj)); //here is your result json object
    callBack(JSON.stringify(jsonObj));
  });
  fs.createReadStream(csvFileName).pipe(csvConverter);
}
exports.csvTojson = csvTojson;
