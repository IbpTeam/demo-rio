var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require('./config');

var mimeTypes = {
     "html": "text/html",
     "jpeg": "image/jpeg",
     "jpg": "image/jpeg",
     "png": "image/png",
     "js": "text/javascript",
     "css": "text/css",
     "txt": "text/plain",
     "mp3": "audio/mpeg3",
     "ogg": "audio/mpeg"
};
function route(handle, pathname, absolute , response, postData) {
  config.riolog("About to route a request for " + pathname);
   
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
    var realPath;
    if(absolute == "query=absolute"){
      realPath = pathname;
    }
    else{
      realPath = "."+pathname;
    }
    //Use api_remote.js for /lib/api.js
    if (pathname == "/lib/api.js") {
      realPath = "./lib/api_remote.js";
    }
    path.exists(realPath, function (exists) {
    config.riolog("realPath="+realPath);
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
                    case 'ogg':
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
