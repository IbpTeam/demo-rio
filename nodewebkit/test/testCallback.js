var array = new Array();

function start(){
  testCallback("test",function(){
  	console.log("this is a test!");
  });
}

function testCallback(arg,callback){
  var item = {
  	name:arg,
  	cb:callback
  };
  array.push(item);
  execArray();
}

function execArray(){
  var myName;
  var myCallback;
  array.forEach(function(item){
  	myName = item.name;
  	myCallback = item.cb;
  });

  if (myName == "test") {
  	myCallback();
  }
}

start();