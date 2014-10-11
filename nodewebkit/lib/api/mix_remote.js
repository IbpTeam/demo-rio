//This file is generated manually.
define(function(){
  var o={};
  function sendrequest(a, ar){
    var sd = {};
    var cb=ar.shift();
    sd.api = a;sd.args = ar;
    $.ajax({
      url: "/callapi", type: "post", contentType: "application/json;charset=utf-8", dataType: "json",
      data: JSON.stringify(sd),
      success: function(r) {setTimeout(cb.apply(null,r), 0);},
      error: function(e) {throw e;}
    });
  }
  o.getHello = function(){
    sendrequest("mix.getHello", Array.prototype.slice.call(arguments));
  }
  o.getHello2 = function(){
    sendrequest("mix.getHello2", Array.prototype.slice.call(arguments));
  }
  o.getHello3 = function(){
    sendrequest("mix.getHello3", Array.prototype.slice.call(arguments));
  }
  o.openDev = function(callback){
    console.log("openDev is not supported now.");
    setTimeout(callback(false), 0);
  }
  o.isLocal = function(callback){
    setTimeout(callback(false), 0);
  }
  return o;
})
