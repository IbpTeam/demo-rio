var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
//var config = require('./config');

var mimeTypes = {
     "html": "text/html",
     "jpeg": "image/jpeg",
     "jpg": "image/jpeg",
     "png": "image/png",
     "js": "text/javascript",
     "css": "text/css",
     "txt": "text/plain",
     "mp3": "audio/mpeg"
};
function route(handle, pathname, absolute , response, postData) {
  console.log("About to route a request for " + pathname);
   
    var pos = pathname.lastIndexOf(".");
    var suffix = '';
    if(pos != -1){
        suffix = pathname.substr(pos+1).toLowerCase();
        //console.log("suffix:", suffix);
    }
    
  if (typeof handle[pathname] == 'function') {
    handle[pathname](response, postData);
  } else {
    //console.log("No request handler found for " + pathname);
    //response.writeHead(404, {"Content-Type": "text/plain"});
    //response.write("404 Not found");
    //response.end();
    if(absolute == "query=absolute"){
      var realPath = pathname;
    }
    else{
      var realPath = "."+pathname;
    }
    path.exists(realPath, function (exists) {
    console.log("realPath="+realPath);
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("This request URL " + realPath + " was not found on this server.");
            response.end();
        } 
        else {
            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    response.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    response.end(err);
                } else {
                    var content_type;
                    switch(suffix){
                    case 'css':
                        content_type = mimeTypes[suffix];
                        break;
                    case 'mp3':
                        content_type = mimeTypes[suffix];
                        break;
                    default:
                        content_type = 'text/html';
                        break;
                    }
                    response.writeHead(200, {
                        'Content-Type': content_type
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        }
      });
   }
}

exports.route = route;
