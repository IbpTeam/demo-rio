//var events = require("events");
//var util = require("util");

//Notice: difference parameters between gen_bar and gen_one_fie
// Template engine
function gen_bar(dirs){
 var result = [];
  //console.log('dirs', dirs);
 for(var i=0; i<dirs.length; i++){
    var dir = dirs[i];
  if(i != dirs.length-1){//<span class="divider">/</span>
   result.push('<li data-path="' + dir.path + '"><a href="#">' + dir.name + '</a></li>');
  }else{
   result.push('<li data-path="' + dir.path + '"  class="active"><a href="#">' + dir.name + '</a></li>');  
  }
 }
 return result.join('\n');
}
function gen_one_fie(dir){
 var result = [];
 result.push('<li data-path="' + dir['props'].path + '"><a href="#">' + dir['props'].name + '</a></li>');
 return result.join('\n');  
}

// Our real type
function AddressBar(element) {
  //events.EventEmitter.call(this);
  this.address_bar = element;

  // Monitor click on AddressBar
  var self = this;
  self.address_bar.delegate('a', 'click', function() {
    self.address_bar.children('.active').removeClass('active');
    $(this).parent().addClass('active');
    self.emit('navigate', $(this).parent().attr('data-path'));
    return false;
  });
  self.address_bar.parent().delegate('input', 'click', function(){
    self.emit('fold_mode_view');
  });
}


//util.inherits(AddressBar, events.EventEmitter);

AddressBar.prototype.set = function(dir_path) {
  //this.current_path = path.normalize(dir_path);
  var path_sep='/';
  this.current_path = dir_path;
  var sequence = this.current_path.split(path_sep);//path.sep
  var result = [];
  var i = 0;
  for (; i < sequence.length; ++i) {
    result.push({
   name: sequence[i],
   path: sequence.slice(0, 1 + i).join(path_sep),
    });
  }
  console.log('current_path:' + this.current_path);
  console.log('sequence:', sequence);
  console.log('result:', result);

  // Add root for *nix
  if (sequence[0] == ''){// && process.platform != 'win32') {
    result[0] = {
      name : 'root',
      path : '/',
    };
  }
 //console.log(gen_bar({sequence : result}));
  this.address_bar.html(gen_bar(result));
}

AddressBar.prototype.enter = function(mine) {
  // Where is current
  var how_many = this.address_bar.children().length;
  var where = this.address_bar.children('.active').index();
  if (where == how_many - 1) {
    // Add '/' on tail
    //this.address_bar.children().eq(-1).append('<span class="divider">/</span>');
  } else {
    this.address_bar.children('li:gt(' + where + ')').remove();
  }

  // Add new folder
  this.address_bar.append(gen_one_fie(mine));
  this.address_bar.find('a:last').trigger('click');
}

$.extend(AddressBar.prototype, $.eventEmitter);
//exports.AddressBar = AddressBar;


  /*
  var sequence = [ "", "home", "cos", "Templates" ];
  var result = [ {
    "name" : "",
    "path" : ""
  }, {
    "name" : "home",
    "path" : "/home"
  }, {
    "name" : "cos",
    "path" : "/home/cos"
  }, {
    "name" : "Templates",
    "path" : "/home/cos/Templates"
  } ];
  */