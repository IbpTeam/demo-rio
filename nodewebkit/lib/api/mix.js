exports.getHello = function(callback){
  setTimeout(callback("Hello World"), 0);
}

exports.getHello2 = function(callback){
  setTimeout(callback("Hello", "World", 2), 0);
}

exports.getHello3 = function(callback){
  require('util').log("test require");;
  setTimeout(callback({str1:"Hello", str2:"World"}, [1, 2, "33"]), 0);
}

exports.openDev = function(callback){
  setTimeout(callback(true), 0);
}
