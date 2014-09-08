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
     "js": "application/javascript",
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
    }
    
  if ( pathname == '/callapi' ) {
    config.riolog("request /callapi:" + postData);
    var postDataJSON=JSON.parse(postData);
    var args=postDataJSON.args;
    var apiPathArr=postDataJSON.api.split(".");
    var sendresponse = function(){
      response.writeHead(200, {"Content-Type": mimeTypes["js"]});
      response.write(JSON.stringify(Array.prototype.slice.call(arguments)));
      response.end();
    }
    args.unshift(sendresponse);
    handle[apiPathArr[0]][apiPathArr[1]].apply(null, args);
  } else if (typeof handle[pathname] == 'function') {
    handle[pathname](response, postData);
  } else {
    //Use api_remote.js for /lib/api.js
    var realPath;
    if (pathname == "/lib/api.js") {
      pathname = "/lib/api_remote.js";
    }else if (pathname.lastIndexOf("/lib/api/", 0) === 0 && pathname.indexOf(".js", pathname.length - 3) !== -1) {
      realPath = "."+pathname.replace(/.js$/,"_remote.js");
      var onehandle = require(".."+pathname.substring(0, pathname.length - 3));
      var modulename = pathname.substring(9, pathname.length - 3);
      handle[modulename] = onehandle;
      path.exists(realPath, function (exists) {
        if (!exists){
          response.writeHead(200, {'Content-Type': content_type = 'application/javascript'});
          //This remote file is from mix_remote.js, this file is template for write code.
          var remotejs='define(function(){var o={};function sendrequest(a, ar){var sd = {};var cb=ar.shift();sd.api = a;sd.args = ar;$.ajax({      url: "/callapi", type: "post", contentType: "application/json;charset=utf-8", dataType: "json", data: JSON.stringify(sd), success: function(r) {setTimeout(cb.apply(null,r), 0);}, error: function(e) {throw e;} });};';
          response.write(remotejs, "binary");
          var func;
          for (func in onehandle) {
            response.write("o.");
            response.write(func);
            response.write('=function(){sendrequest("');
            response.write(modulename);
            response.write('.');
            response.write(func);
            response.write('", Array.prototype.slice.call(arguments));};');
          }
          response.write('return o;});', "binary");
          response.end();
          return;
        }
      });
      return;
    }
    path.exists("."+pathname, function (exists) {
      config.riolog("pathname="+pathname);
      if (!exists) {
        realPath = pathname;
      }else {
        realPath = "." + pathname;
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
              case 'js':
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
    });
  }
}

exports.route = route;
