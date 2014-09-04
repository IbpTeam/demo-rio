!function(factory) {
  if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
    var target = module['exports'] || exports; 
    factory(target);
  } else if (typeof define === 'function' && define['amd']) {
    define(['exports'], factory);
  }
}(function(apiExports){
  var api = typeof apiExports !== 'undefined' ? apiExports : {};
  api.getHello = function(){
    return 'Hello World'; 
  }
})
