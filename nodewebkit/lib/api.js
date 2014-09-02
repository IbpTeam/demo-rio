function addlib(){
  var createnode = function() {
    var head = document.getElementsByTagName('head')[0],
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    return script;
  }
  
  node = createnode();

  script.src = url;
head.appendChild(script);
}
