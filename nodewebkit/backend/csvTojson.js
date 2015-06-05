var fs = require('fs');
var Converter = require("csvtojson").core.Converter;
var Q = require('q');

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

function Q_csvTojson(csvPath) {
  var deferred = Q.defer();
  var csvFileName = csvPath;
  var csvConverter = new Converter();
  csvConverter.on("end_parsed", function(jsonObj) {
    //console.log(JSON.stringify(jsonObj)); //here is your result json object
    deferred.resolve(JSON.stringify(jsonObj));
  });
  csvConverter.on("error", function(err) {
    deferred.reject(new Error(err));
  })
  fs.createReadStream(csvFileName).pipe(csvConverter);
  return deferred.promise;
}
exports.Q_csvTojson = Q_csvTojson;