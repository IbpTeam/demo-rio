var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require('./config');
var appManager = require('./app/appManager');

var mimeTypes = {
     "html": "text/html",
     "jpeg": "image/jpeg",
     "jpg": "image/jpeg",
     "png": "image/png",
     "js": "application/javascript",
     "css": "text/css",
     "txt": "text/plain",
     "mp3": "audio/mpeg3",
     "ogg": "audio/mpeg",
     "svg": "image/svg+xml",
     "ico": "image/x-icon"
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
            response.end(err.message);
          } else {
            var content_type;
            var suffix = pathname.substring(pathname.lastIndexOf('.') + 1).toLowerCase();
            switch(suffix){
            case 'css':
            case 'mp3':
            case 'ogg':
            case 'js':
            case 'svg':
            case 'ico':
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

// used for web socket server to store ws client
var eventList = [];

function eventListClear(){
  eventList=[];
}
exports.eventListClear=eventListClear;
/**
 * This is the function to handle web socket message
 * param:
 * client: WebSocket client object.
 * msg(string): {
 *  'Action': ('on'|'off'|'notify'|'ping'),
 *  'Event': a string to describe the event type,
 *  'Data': a json object,
 *  'Status': ('ok'|'error')
 * }.
 */
function handleWSMsg(client, msg) {
  try {
    var jMsg = JSON.parse(msg);
  } catch(e) {
    return client.send('{\"Error\":\"' + e + '\"}');
  }
  switch(jMsg.Action) {
    case 'on':
      // register a client object to a event presented by jMsg.Event
      if(typeof eventList[jMsg.Event] === 'undefined') {
        eventList[jMsg.Event] = [];
      }
      var i;
      for(i = 0; i < eventList[jMsg.Event].length; ++i) {
        if(eventList[jMsg.Event][i] == client) break;
      }
      if(i == eventList[jMsg.Event].length) {
        eventList[jMsg.Event].push(client);
        client.send(JSON.stringify({
          'Status': 'OK',
          'Data': {
            'msg': 'register success'
          },
          'Event': jMsg.Event
        }));
      } else {
        client.send(JSON.stringify({
          'Status': 'ERROR',
          'Data': {
            'msg': 'registered already'
          },
          'Event': jMsg.Event
        }));
      }
      break;
    case 'off':
      // remove a client object from a event presented by jMsg.Event
      if(typeof eventList[jMsg.Event] !== 'undefined') {
        removeWSListener(eventList[jMsg.Event], client);
      }
      break;
    case 'notify':
      // send a notify message to client objects registed to jMsg.Event
      if(typeof eventList[jMsg.Event] !== 'undefined') {
        for(var i = 0; i < eventList[jMsg.Event].length; ++i) {
          if(jMsg.SessionID == eventList[jMsg.Event][i]._socket._handle.fd) continue;
          eventList[jMsg.Event][i].send(msg);
        }
      }
      break;
    case 'ping':
      client.send(JSON.stringify({
        'Status': 'ok',
        'Event': 'pong',
        'Action': 'pong'
      }));
      break;
    default:
      // client.send('{\"Error\":\"Unknown Action type.\"}');
      break;
  }
}

function removeWSListener(list, client) {
  for(var i = 0; i < list.length; ++i) {
    if(client == list[i]) {
      list.splice(i, 1);
      break;
    }
  }
}

function removeWSListeners(client) {
  for(var key in eventList) {
    removeWSListener(eventList[key], client);
  }
}

exports.removeWSListeners = removeWSListeners;

/**
 * This is the function to notify web sockets which has registered in web socket server
 * param:
 * msg(object): {
 *  'Action': 'notify',
 *  'Event': a string to describe the event type,
 *  'Data': a json object,
 *  'Status': ('ok'|'error'),
 *  'SessionID': the ID of session who want to notify others and will not be notified
 * }
 */
function wsNotify(msg) {
  if(typeof msg.Action === 'undefined' || msg.Action != 'notify')
    return console.log('Bad notify');
  try {
    handleWSMsg(null, JSON.stringify(msg));
  } catch(e) {
    console.log(e);
  }
}
exports.wsNotify = wsNotify;

/**
 * This is the key function of http router
 * param:
 * handle: store some handler.
 * pathname: The path is requested.
 * response: The response object. if the pathname is websocket path,
 *           then the reponse is a websocket client object.
 * postData: The message or data from the request.
 */
function route(handle, pathname, response, postData) {
  console.log("The route for path: %s, data: %s", pathname, postData);
  if ( pathname == '/') {
    response.write("The index pages is blank.");
    response.end();
    return;
  }else if ( pathname == '/ws') {
    var wsclient = response;
    var message = postData;
    wsclient.send("I have got your message whose length is " + postData.length);
    // Handle message
    handleWSMsg(wsclient, message);
    return;
  }else if ( pathname == '/callapi' ) {
    //This is for remote call api in internet browser.
    if ( postData === null || postData.length === 0 ){
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write("Invalid callapi");
      response.end();
      return;
    }
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
    // This is for remote open app in internet browser.
    // request url: /callapp/ + appID + / + request file name
    var url = pathname.replace(/^\//, '').split('/'),
        sAppID = url[1],
        sFilename = path.join.apply(this, url.slice(2));
    // var sAppName=pathname.substring(9, pathname.indexOf('/', 10));
    // var sFilename=pathname.substring(9 + sAppName.length + 1, pathname.length);
    /* var runapp=null; */
    // var app;
    // for(var i = 0; i < config.AppList.length; i++) {
      // app = config.AppList[i];
      // if (app.name == sAppName) {
        // runapp=app;
        // break;
      // }
    /* } */

    var runapp = appManager.getRegistedInfo(sAppID),
        rootPath = (runapp.local ? '' : config.APPBASEPATH);
    if(runapp === null) {
      console.log("Error no app " + sAppID);
      response.writeHead(404, {
        'Content-Type': 'text/plain'
      });
      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
      return;
    }

    if(sFilename === "index.html") {
      getRealFile(path.join(rootPath, runapp.path, sFilename), response);
    } else if(sFilename === "lib/api.js") {
      getRealFile(path.join(rootPath, runapp.path, "lib/api_remote.js"), response);
    } else if(sFilename.lastIndexOf("lib/api/", 0) === 0 
        && sFilename.indexOf(".js", sFilename.length - 3) !== -1) {
      var modulename = sFilename.substring(8, sFilename.length - 3);
      getRemoteAPIFile(handle, modulename, response);
    } else {
      getRealFile(path.join(rootPath, runapp.path, sFilename), response);
    }
    return;
  } else {
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
