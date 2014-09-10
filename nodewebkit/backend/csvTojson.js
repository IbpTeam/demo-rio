var fs = require('fs');
var csv2json = require('csv2json-stream');

function csvTojson(csvPath, callBack){
  var opts = {
    delim : ',',
    // columns: ['Column1', 'Column2', 'Column3'],
    headers: true,
    outputArray: true
  };
  var readStream = fs.createReadStream(csvPath);
  var stream = readStream.pipe(csv2json(opts));
  var jsonString = "";
  stream.on('data', function(chunk) {
    jsonString += chunk;
  });
  readStream.on('end', function(){
    var json = JSON.parse(jsonString);
    json.pop();
    console.log(json);
    callback(json);
  });
}
exports.csvTojson = csvTojson;
