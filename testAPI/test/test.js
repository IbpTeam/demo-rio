function test2(){
  console.log("arguments:" + arguments.length + " " + arguments);
  var args = Array.prototype.slice.call(arguments);
  console.log("args:" + args.length + " " + args);
  var i;
  for (i = 0 ; i < args.length; i += 1) { 
    console.log("args[i]:" + typeof args[i] + " " + args[i]);
  }
  console.log("test2");
}

function test(){
  console.log("arguments:" + arguments.length + " " + arguments);
  console.log("callee:" + this);
  var args = Array.prototype.slice.call(arguments);
  console.log("args:" + args.length + " " + args);
  cb = args.shift();
  console.log("cb:" + typeof cb + " " + cb);
  var i;
  for (i = 0 ; i < args.length; i += 1) { 
    console.log("args[i]:" + typeof args[i] + " " + args[i]);
  }
  setTimeout(function(){test2.apply(null, args)}, 0);
  var json = JSON.stringify(args);
  setTimeout(function(){test2.apply(null, JSON.parse(json))}, 0);
  console.log("test");
}

function test3(){
}

//test("a", 1, [1,2,"3"]);
//test();
test("", test3, test3, "2", 1)
