var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');

function route(handle, pathname, response, postData) {
  console.log("About to route a request for " + pathname);
  if (typeof handle[pathname] == 'function') {
    handle[pathname](response, postData);
  } else {
    //console.log("No request handler found for " + pathname);
    //response.writeHead(404, {"Content-Type": "text/plain"});
    //response.write("404 Not found");
    //response.end();
    var realPath = "/home/v1/demo-rio/nodewebkit" + pathname;

    path.exists(realPath, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write("This request URL " + pathname + " was not found on this server.");
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
                    response.writeHead(200, {
                        'Content-Type': 'text/html'
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
