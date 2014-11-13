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

function getRemoteAPIFile(handle, modulename, response){
      var realPath = path.join(__dirname, "../lib/api/", modulename + "_remote.js");
      var onehandle = require("../lib/api/" + modulename + ".js");
      handle[modulename] = onehandle;
      path.exists(realPath, function (exists) {
        var handle_remote=[];
        if (exists){
          handle_remote=require(realPath);
        }
        //The follow content is template for write code.
        //The mix_remote.js file is example of replacing remote function.
        /**
          * define(function(){
          *   var o={};
          *   function sendrequest(a, ar){
          *     var sd = {};
          *     var cb=ar.shift();
          *     sd.api = a;sd.args = ar;
          *     $.ajax({
          *       url: "/callapi", type: "post", contentType: "application/json;charset=utf-8", dataType: "json",
          *       data: JSON.stringify(sd),
          *       success: function(r) {setTimeout(cb.apply(null,r), 0);},
          *       error: function(e) {throw e;}
          *     });
          *   }
          *   o.getHello = function(){
          *     sendrequest("mix.getHello", Array.prototype.slice.call(arguments));
          *   }
          *   o.getHello2 = function(){
          *     sendrequest("mix.getHello2", Array.prototype.slice.call(arguments));
          *   }
          *   o.getHello3 = function(){
          *     sendrequest("mix.getHello3", Array.prototype.slice.call(arguments));
          *   }
          *   o.openDev = function(callback){
          *     console.log("openDev is not supported now.");
          *     setTimeout(callback(false), 0);
          *   }
          *   o.isLocal = function(callback){
          *     setTimeout(callback(false), 0);
          *   }
          *   return o;
          * })
          */
        response.writeHead(200, {'Content-Type': content_type = 'application/javascript'});
        var remotejs='define(function(){var o={};function sendrequest(a, ar){var sd = {};var cb=ar.shift();sd.api = a;sd.args = ar;$.ajax({      url: "/callapi", type: "post", contentType: "application/json;charset=utf-8", dataType: "json", data: JSON.stringify(sd), success: function(r) {setTimeout(cb.apply(null,r), 0);}, error: function(e) {throw e;} });};';
        response.write(remotejs, "binary");
        var func;
        for (func in onehandle) {
          response.write("o.");
          response.write(func);
          if ( "function" === typeof handle_remote[func]) {
            response.write("=");
            response.write(handle_remote[func]+";");
          }else {
            response.write('=function(){sendrequest("');
            response.write(modulename);
            response.write('.');
            response.write(func);
            response.write('", Array.prototype.slice.call(arguments));};');
          }//end of if func exist in ***_remote.js
        }//end for one handle
        response.write('return o;});', "binary");
        response.end();
        return;
      });//end of path exist
      return;
}

function getRealFile(pathname, response){
  path.exists("."+pathname, function (exists) {
    var realPath;
    if (!exists) {
      realPath = pathname;
    }else {
      realPath = "." + pathname;
    }
    path.exists(realPath, function (exists) {
      if (!exists) {
        response.writeHead(404, {
          'Content-Type': 'text/plain'
        });
        response.write("This request URL " + realPath + " was not found on this server.");
        response.end();
      }else {
        fs.readFile(realPath, "binary", function (err, file) {
          if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.end(err);
          } else {
            var content_type;
            var suffix = pathname.substring(pathname.lastIndexOf('.') + 1).toLowerCase();
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

/**
 * This is the key function of http router
 */
function route(handle, pathname, response, postData) {
  if ( pathname == '/callapi' ) {
    //This is for remote call api in internet browser.
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
    return;
  }else if ( pathname.lastIndexOf("/callapp/", 0) === 0) {
    //This is for remote open app in internet browser.
    var sAppName=pathname.substring(9, pathname.indexOf('/', 10));
    var sFilename=pathname.substring(9 + sAppName.length + 1, pathname.length);
    var runapp=null;
    var app;
    for(var i = 0; i < config.AppList.length; i++) {
      app = config.AppList[i];
      if (app.name == sAppName) {
        runapp=app;
        break;
      }
    }

    if (runapp === null) {
      console.log("Error no app " + sAppName);
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
      return;
    }

    dirOfrunapp=runapp.path.substring(0, runapp.path.lastIndexOf('/'));
    var realpath;
    if ( sFilename === "index.html" ) {
      getRealFile(path.join(config.APPBASEPATH, runapp.path), response);
    } else if ( sFilename === "lib/api.js") {
      getRealFile(path.join(config.APPBASEPATH, dirOfrunapp, "lib/api_remote.js"), response);
    } else if ( sFilename.lastIndexOf("lib/api/", 0) === 0 && sFilename.indexOf(".js", sFilename.length - 3) !== -1) {
      var modulename = sFilename.substring(8, sFilename.length - 3);
      getRemoteAPIFile(handle, modulename, response);
    }else {
      getRealFile(path.join(config.APPBASEPATH, dirOfrunapp, sFilename), response);
    }
    return;
  }else {
    //Use api_remote.js for /lib/api.js
    var realPath;
    if (pathname == "/lib/api.js") {
      pathname = "./lib/api_remote.js";
      getRealFile(pathname, response);
      return;
    }else if (pathname.lastIndexOf("/lib/api/", 0) === 0 && pathname.indexOf(".js", pathname.length - 3) !== -1) {
      var modulename = pathname.substring(9, pathname.length - 3);
      getRemoteAPIFile(handle, modulename, response);
      return;
    }else {
      getRealFile(pathname, response);
      return;
    }//end of /lib/api/***.js
  }//end of if callapi callapp and else
}

exports.route = route;
