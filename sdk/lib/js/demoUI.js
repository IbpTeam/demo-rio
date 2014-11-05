/*! ui-lib - v0.0.1 - 2014-11-05
* Copyright (c) 2014 */
function Class() {}

//Use extend to realize inhrietion
//
Class.extend = function extend(props) {
  var prototype = new this();
  var _super = this.prototype;

  for(var name in props) {
    //if a function of subclass has the same name with super
    //override it, not overwrite
    //use this.callSuper to call the super's function
    //
    if(typeof props[name] == "function"
        && typeof _super[name] == "function") {
      prototype[name] = (function(super_fn, fn) {
        return function() {
          var tmp = this.callSuper;
          this.callSuper = super_fn;
          
          var ret = fn.apply(this, arguments);

          this.callSuper = tmp;
          
          if(!this.callSuper) {
            delete this.callSuper;
          }

          return ret;
        }
      })(_super[name], props[name])
    } else {
      prototype[name] = props[name];
    }
  }

  var SubClass = function() {};

  SubClass.prototype = prototype;
  SubClass.prototype.constructor = SubClass;

  SubClass.extend = extend;
  //Use create to replace new
  //we need give our own init function to do some initialization
  //
  SubClass.create = SubClass.prototype.create = function() {
    var instance = new this();

    if(instance.init) {
      instance.init.apply(instance, arguments);
    }

    return instance;
  }

  return SubClass;
}

var ContextMenu = Class.extend({
  init: function(options_) {
    this._options = {
      fadeSpeed: 100,
      filter: function ($obj) {
        // Modify $obj, Do not return
      },
      above: 'auto',
      preventDoubleContext: true,
      compress: false
    };
    this._menus = [];

    for(var key in options_) {
      this._options[key] = options_[key];
    }

    var _this = this;
    $(document).on('mouseup', 'html', function (e) {
      e.preventDefault();
      // e.stopPropagation();
      if(e.which == 1)
        _this.hide();
    });
    if(this._options.preventDoubleContext) {
      $(document).on('contextmenu', '.dropdown-context', function (e) {
        e.preventDefault();
      });
    }
    $(document).on('mouseenter', '.dropdown-submenu', function(){
      var $sub = $(this).find('.dropdown-context-sub:first'),
        subWidth = $sub.width(),
        subLeft = $sub.offset().left,
        collision = (subWidth + subLeft) > window.innerWidth;
      if(collision){
        $sub.addClass('drop-left');
      }
    });
  },

  getMenuByHeader: function(header_) {
    return this._menus['dropdown-' + header_];
  },
  
  addItem: function($menu_, item_, $index_) {
    var linkTarget = '';
    if (typeof item_.divider !== 'undefined') {
      if (typeof $index_ !== 'undefined') 
        $index_.after('<li class="divider"></li>');
      else 
        $menu_.append('<li class="divider"></li>');
    } else if (typeof item_.header !== 'undefined') {//should be added just once!!
      if (typeof $index_ !== 'undefined') 
        $index_.after('<li class="nav-header">' + item_.header + '</li>');
      else 
      $menu_.append('<li class="nav-header">' + item_.header + '</li>');
    } else {
      if (typeof item_.href == 'undefined') {
        item_.href = '#';
      }
      if (typeof item_.target !== 'undefined') {
        linkTarget = ' target="' + item_.target + '"';
      }
      if (typeof item_.subMenu !== 'undefined') {
        if (typeof item_.icon !== 'undefined') {
          $sub = ('<li class="dropdown-submenu active"><a class="width-icon" tabindex="-1" href="' + item_.href + '">' 
            + '<i class= \'' + item_.icon + '\'></i><span>  </span>' + item_.text + '</a></li>');
        }else {
          $sub = ('<li class="dropdown-submenu active"><a class="widthout-icon" tabindex="-1" href="' + item_.href + '">' 
              + item_.text + '</a></li>');
        }
      } else {
        if (typeof item_.icon !== 'undefined') {
          $sub = $('<li class="active"><a class="width-icon" tabindex="-1" href="' + item_.href + '"' + linkTarget + '>' 
              + '<i class= \'' + item_.icon + '\'></i><span>  </span>' + item_.text + '</a></li>');
        } else {
          $sub = $('<li class="active"><a class="widthout-icon" tabindex="-1" href="' + item_.href + '"' + linkTarget + '>' 
              + item_.text + '</a></li>');
        }
      }
      if (typeof item_.action !== 'undefined') {
        var actiond = new Date(),
          actionID = 'event-' + actiond.getTime() * Math.floor(Math.random()*100000),
          eventAction = item_.action;
        $sub.find('a').attr('id', actionID);
        $('#' + actionID).addClass('context-event');
        $(document).on('mousedown', '#' + actionID, function(e) {
          e.preventDefault();
          e.stopPropagation();
        }).on('mouseup', '#' + actionID, eventAction)
        .on('click', '#' + actionID, function(e) {
          e.preventDefault();
          e.stopPropagation();
        });
      }
      if (typeof $index_ !== 'undefined') 
        $index_.after($sub);
      else 
        $menu_.append($sub);
      if (typeof item_.subMenu != 'undefined') {
        var subMenuData = this.addCtxMenu(item_.subMenu, true);
      if (typeof $index_ !== 'undefined') 
        $index_.next().append(subMenuData);
      else 
        $menu_.find('li:last').append(subMenuData);
      }
    }
    if (typeof this._options.filter == 'function') {
      if (typeof $index_ !== 'undefined') 
        this._options.filter($menu_.find('li:last'));
        //this._options.filter($index_.next());
      
    }
  },

  addCtxMenu: function(data, subMenu) {
    var _id = 'dropdown-' + data[0].header;
    if(typeof this._menus[_id] !== 'undefined') {
      console.log('the menu of this header already existed!');
      return ;
    }
    var subClass = '';
    var compressed = this._options.compress ? ' compressed-context' : '';
    if(subMenu) {
      subClass = ' dropdown-context-sub';
    } else {
      $('.dropdown-context').fadeOut(this._options.fadeSpeed, function(){
        $('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
      });
    }
    var $menu = $('<ul class="dropdown-menu dropdown-context' 
        + subClass + compressed + '" id="' + _id + '"></ul>');
    for(var i = 0; i < data.length; ++i) {
      this.addItem($menu, data[i]);
    }
    $('body').append($menu);
    this._menus[_id] = $menu;
    return $menu;
  },

  removeMenuByHeader: function(header_) {
    this._menus['dropdown-' + header_].remove();
    delete this._menus['dropdown-' + header_];
  },

  getItemByText:function($menu_, text_){
    var _items = $menu_.children('li');
    for (var i = 0; i < _items.length; i++) {
      if(_items[i].textContent.replace('  ','') === text_)
        return $(_items[i]);
    }
    return undefined;
  },

  removeItem:function($item_){
    $item_.remove();
  },

  hasItem:function($menu_, item_){
    var _items = $menu_.children('li');
    for (var i = 0; i < _items.length; i++) {
      if(_items[i].textContent === item_.text)
        return true;
    }
    return false;
  },

  show: function($menu_, left_, top_) {
    $('.dropdown-context:not(.dropdown-context-sub)').hide();
    
    $menu_.css({
      top: top_,
      left: left_
    }).fadeIn(this._options.fadeSpeed);
  },

  hide: function() {
    $('.dropdown-context').fadeOut(this._options.fadeSpeed, function() {
      $('.dropdown-context').css({display:''}).find('.drop-left').removeClass('drop-left');
    });
  },

  attachToMenu: function(selector_, $menu_, function_) {
    var _this = this;
    $(document).on('contextmenu', selector_, function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("selector: " + selector_);
      if (e.target.tagName !== 'HTML') {
        if (typeof function_ == 'function') {
          function_(selector_.replace('#',''), $menu_);
        };
      }
      var w = $menu_.width();
      var h = $menu_.height();
      left_ = (document.body.clientWidth < e.clientX + w) 
              ? (e.clientX - w) : e.clientX;
      top_ = ($(document).height()< e.clientY + h + 25) 
              ? (e.clientY-h-10)  : e.clientY;
      _this.show($menu_, left_, top_);
    });
  },

  detachFromMenu: function(selector_, $menu_) {
    $(document).off('contextmenu', selector_);
  },

  activeItem: function(header_, text_, eventAction_) {
    var _menuli = this.getItemByText(
        this.getMenuByHeader(header_), text_);
    if (typeof _menuli == 'undefined') return ;
    _menuli.removeClass('disabled');
    _menuli.addClass('active');
    var _aId = $(_menuli).children('a')[0].id;
    if ((typeof _aId !== 'undefined' || _aId !== '') && typeof eventAction_ !== 'undefined') {
      $('#' + _aId).addClass('context-event');
      $(document).off('mouseup', '#' + _aId);
      $(document).on('mouseup', '#' + _aId, eventAction_);
    }
    return ;
  },

  disableItem: function(header_, text_) {
    var _menuli = this.getItemByText(
        this.getMenuByHeader(header_), text_);
    if (typeof _menuli == 'undefined') return ;
    _menuli.removeClass('active');
    _menuli.addClass('disabled');
    var _aId = $(_menuli).children('a')[0].id;
    $('#' + _aId).removeClass('context-event');
    $(document).off('mouseup', '#' + _aId);
    $(document).on("mouseup", '#' + _aId, function(e){
      e.preventDefault();
    }) ;
    return ;
  },

  isDisabledItem:function(header_, text_){
    var _menuli = this.getItemByText(
        this.getMenuByHeader(header_), text_);
    if (typeof _menuli == 'undefined') return null;
    return _menuli.hasClass('disabled');
  }
});

var Gauge = Class.extend({
  init:function(options_){
    this._defaultOptions = {
    	  width: 400,
    	  height: 30,
    	  reflex: 0.5,
    	  opacity: 0.25,
    	  pulse: 100,
    	  limit: false,
    	  noscale: false,
    	  gradient: false,
    	  vertical: false,
    	  busy: false,
    	  radius: 1.0,
    	  scale: null,
    	  empty: '#cccccc',
    	  name: null,
    	  values: null,
    	  colors: ['#3765d9','#9ede7c','#9e42ee','#ec7612','#00aaaa','#cc0000','#aaaa00','#008000']
    };
    this.setOptions(this._defaultOptions, options_);
  },

  setOptions:function(dest_, options_){
    if (options_) {
    	  for (var key in options_) {
    	   dest_[key] = options_[key];
    	  };
    };
  },

  add:function($div_, options_){
    var _this = this;
    var _options = {};
    _this.setOptions(_options, _this._defaultOptions);
    _this.setOptions(_options, options_);
    var _vo = _options.vertical;
    var _width = Math.max(_options.width, (_vo?8:48));
    var _height = Math.max(_options.height, (_vo?48:12));
    if (!_vo && _width < (_height*3)) {
    	  _width = _height * 3;
    };
    if (_vo && _height < (_width * 3)) {
    	  _height = _width * 3; 
    };
    var _id = (_options.name !== null) ? _options.name : $div_[0].id + '_gauge';
    if (!document.getElementById(_id)) {
    	  if(document.all&&document.namespaces&&!window.opera&&(!document.documentMode||document.documentMode<9)) {
    	    if(document.namespaces['v']==null) {
    	      var _e = ["shape","shapetype","group","background","path","formulas","handles","fill","stroke","shadow","textbox","textpath","imagedata","line","polyline","curve","roundrect","oval","rect","arc","image"];
    	      var _s = document.createStyleSheet(); 
    	      for (var i = 0; i < _e.length; i++) {
    	        _s.addRule("v\\:"+e[i],"behavior: url(#default#VML);");
    	      };
    	      document.namespaces.add("v","urn:schemas-microsoft-com:vml");
    	    }
    	    var _dpl = ($div_.currentStyle.display.toLowerCase() === 'block') ? 'block' : 'inline-block';
    	    var _self = document.createElement(['<var style="zoom:1;display:'+_dpl+';width:'+_width+'px;height:'+_height+'px;padding:0px;margin:0px;">'].join(''));
    	    var _flt = object.currentStyle.styleFloat.toLowerCase();
    	    _self._dpl = (_flt == 'left' || flt == 'right') ? 'inline' : 'inline-block';
    	  } else {
    	    var _self = document.createElement('canvas');
    	    _self.wk4 = navigator.appVersion.indexOf('WebKit') != -1 && ! document.defaultCharset? 1 : 0;
    	    _self.ge8 = navigator.userAgent.indexOf('Gecko') > -1 && window.updateCommands && !window.external? 1: 0;
    	  }
    	  if (_self || _self.getContext("2d")) {
    	    _self.options = _options;
    	    _self.id = _id;
    	    _self.style.padding = '0px';
    	    _self.style.margin = '0px';
    	    _self.style.border = 'none';
    	    _self.style.width = _width + 'px';
    	    _self.style.height = _height + 'px';
    	    _self.width = _width;
    	    _self.height = _height;
    	    $div_.innerHTML = '';
    	    $div_.append(_self);
    	    _this.modify(_self,_options);
    	  };
    };
  },


  modify:function(self,options){
    var _this =this;
    var _options = self.options;
    function hex2rgb(val){
      function h2d(v){
        return (Math.max(0, Math.min(parseInt(v,16),255)));
      }
      return h2d(val.substr(1,2)) + ',' + h2d(val.substr(3,2))+ ',' + h2d(val.substr(5,2));
    }
    function  P(i_){
      var _p = self.cl.concat(_options.colors);
      var _k = _p.length-1;
      var _t = i_;
      if (_t > _k) {
        _t = (i_ % _k)  - 1;
      };
      return _p[_t];
    }
    function F(a,z,v,q){
      var r,g,b,x,y,l=1-v;
      function h2d(h){
      return (Math.max(0, Math.min(parseInt(h,16),255)));
      }
      function d2h(v){
      v = Math.round(Math.min(Math.max(0,v),255));
      return('0123456789ABCDEF'.charAt((v-v%16)/16) + '0123456789ABCDEF'.charAt(v%16));
      }
      x = h2d(a.substr(1,2));
      y = h2d(z.substr(1,2));
      r = Math.max(0,Math.min(255,parseInt((x*l)+(y*v))));
      x = h2d(a.substr(3,2));
      y = h2d(z.substr(3,2));
      g = Math.max(0,Math.min(255,parseInt((x*l)+(y*v))));
      x = h2d(a.substr(5,2));
      y = h2d(z.substr(5,2));
      b = Math.max(0,Math.min(255,parseInt((x*l)+(y*v))));
      if (!q) {
      return ('#'+d2h(r) + d2h(g)+d2h(b));
      } else {
      return (r+','+g+','+b);
      }
    }
  if(self) {
    var i,q,g,c,n,a,z,l,t=0,j=0,m=0,s=0,e=0,y=0,x=0,v=(self.width<self.height?1:0),r=parseInt(v?self.width/2:self.height/3),h=v?self.height-r:r*2,w=self.width,b=parseInt((v?w:h)*1.1),k=Math.round(((v?h:w)-(2*r))/b);
    self.cc=(typeof options['empty']==='string'?options['empty']:self.options['empty']);
    self.cc=self.cc.match(/^#[0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f][0-9a-f]$/i)?self.cc:_options.empty;
    self.options['empty']=self.cc; 
    self.dc=hex2rgb(self.cc);
    self.ty=Math.min(Math.max((typeof options['reflex']==='number'?options['reflex']:self.options['reflex']),0.001),1.0); 
    self.options['reflex']=self.ty;
    self.op=Math.min(Math.max((typeof options['opacity']==='number'?options['opacity']:self.options['opacity']),0.001),1.0); 
    self.options['opacity']=self.op;
    self.cr=Math.min(Math.max((typeof options['radius']==='number'?options['radius']:self.options['radius']),0.001),1.0); 
    self.options['radius']=self.cr;
    self.pl=Math.min(Math.max((typeof options['pulse']==='number'?options['pulse']:self.options['pulse']),30),1000); 
    self.options['pulse']=self.pl;
    self.cl=(typeof options['colors']==='object'?options['colors']:self.options['colors']);
    self.options['colors']=self.cl; 
    self.vl=(typeof options['values']==='object'?options['values']:self.options['values']); 
    self.options['values']=self.vl;
    self.gr=(typeof options['gradient']==='boolean'?options['gradient']:self.options['gradient']); 
    self.options['gradient']=self.gr;
    self.lv=(typeof options['limit']==='boolean'?options['limit']:self.options['limit']); 
    self.options['limit']=self.lv;
    self.ns=(typeof options['noscale']==='boolean'?options['noscale']:self.options['noscale']); 
    self.options['noscale']=self.ns; 
    self.vo=(self.width<self.height?1:0);
    self.bu=(typeof options['busy']==='boolean'?options['busy']:self.options['busy']);
    self.options['busy']=self.bu; 
    if(options['scale']!=null) {
      self.sn=Math.min(Math.max((typeof options['scale']==='number'?options['scale']:self.options['scale']),2),parseInt((v?h:w)/8));
      self.options['scale']=self.sn;
    } 
    if(self.sn!=null) {
      b=parseInt((v?h:w)/self.sn); 
      k=Math.round((v?h:w)/b)-1;
    } 
    q=parseInt(r*self.cr); 
    if(self.timer) {
      window.clearInterval(self.timer);
    }
    if(document.all&&document.namespaces&&!window.opera&&self.tagName.toUpperCase()=="VAR"&&(!document.documentMode||document.documentMode<9)) {
      var head,foot,fyll,flex,shadb,shadd,scalb='',scald='';
      var j='m 0,0 l 0,'+parseInt((r-q)*100)+' qy '+parseInt(q*100)+','+parseInt(r*100)+' l '+parseInt((w-q)*100)+','+parseInt(r*100)+' qx '+parseInt(w*100)+','+parseInt((r-q)*100)+' l '+parseInt(w*100)+',0 x e';
      head='<v:group style="zoom:1;display:'+self.dpl+';margin:0px;padding:0px;position:relative;width:'
          +self.width+'px;height:'+self.height+'px;" coordsize="'+self.width+','+self.height
          +'"><v:rect filled="f" stroked="f" strokeweight="0" style="zoom:1;display:block;position:absolute;top:0px;left:0px;margin:0px;padding:0px;width:'
          +self.width+'px;height:'+self.height+'px;"></v:rect>'; foot='</v:group>';
      fyll='<v:roundrect id="'+(self.id+'_fyll')+'" arcsize="'+(self.cr*0.5)+'" style="width:'+w+'px;height:'+h
          +'px;left:0px;top:0px;position:absolute;display:block;margin:0px;padding:0px;" filled="f" stroked="f" strokeweight="0">';
      flex='<v:shape id="'+(self.id+'_flex')+'" coordorigin="0,0" coordsize="'+(w*100)+','+(r*100)+'" path="'+j
          +'" style="filter:Alpha(opacity='+(100-(100*self.ty))+',finishOpacity=0,startX=0,finishX=0,startY=0,finishY=100,style=1); width:'+w
          +'px;height:'+r+'px;left:0px;top:'+h+'px;position:absolute;display:block;margin:0px;padding:0px;rotation:180;" '
          +'filled="f" stroked="f" strokeweight="0">';
      if(v) {
        j='m '+parseInt(r*100)+',0 l '+parseInt(q*100)+',0 qx 0,'+parseInt(q*100)+' l 0,'+parseInt((h-q)*100)+' qy '+parseInt(q*100)+','
            +parseInt(h*100)+' l '+parseInt(r*100)+','+parseInt(h*100)+' x e';
        shadb='<v:shape print="false" coordorigin="0,0" coordsize="'+(r*100)+','+(h*100)+'" path="'+j+'" style="width:'+r
            +'px;height:'+h+'px;left:0px;top:0px;position:absolute;display:block;margin:0px;padding:0px;rotation:0;" '
            +'filled="t" stroked="f" strokeweight="0"><v:fill color="white" opacity="0.5" color2="white" o:opacity2="0.0" '
            +'type="gradient" method="linear" angle="270" /></v:shape>';
        shadd='<v:shape print="false" coordorigin="0,0" coordsize="'+(r*100)+','+(h*100)+'" path="'+j+'" style="width:'+r
            +'px;height:'+h+'px;left:'+r+'px;top:0px;position:absolute;display:block;margin:0px;padding:0px;rotation:180;" '
            +'filled="t" stroked="f" strokeweight="0"><v:fill color="black" opacity="0.33" color2="black" o:opacity2="0.0" '
            +'type="gradient" method="sigma" angle="90" /></v:shape>';
      }else {
        shadb='<v:shape print="false" coordorigin="0,0" coordsize="'+(w*100)+','+(r*100)+'" path="'+j+'" style="width:'+w
            +'px;height:'+r+'px;left:0px;top:0px;position:absolute;display:block;margin:0px;padding:0px;rotation:180;" '
            +'filled="t" stroked="f" strokeweight="0"><v:fill color="white" opacity="0.5" color2="white" o:opacity2="0.0" '
            +'type="gradient" method="linear" angle="180" /></v:shape>';
        shadd='<v:shape print="false" coordorigin="0,0" coordsize="'+(w*100)+','+(r*100)+'" path="'+j+'" style="width:'+w
            +'px;height:'+r+'px;left:0px;top:'+r+'px;position:absolute;display:block;margin:0px;padding:0px;rotation:0;" '
            +'filled="t" stroked="f" strokeweight="0"><v:fill color="black" opacity="0.33" color2="black" o:opacity2="0.0" '
            +'type="gradient" method="sigma" angle="0" /></v:shape>';
      }if(self.vl&& !self.bu) {
        l=self.vl.length-(self.lv&&self.vl.length>=2?1:0); 
        for(i=0; i<l; i++) {
          m+=Math.abs(self.vl[i]);
        } 
        m=Math.max(m,Math.abs(self.vl[self.vl.length-1])); 
        a=P(0); 
        z=P(l-1); 
        e=0; 
        n='';
        if(self.lv&&self.gr&&l==1) {
          z=self.cc; c=P(1); 
          s=100*(Math.abs(self.vl[0])/m); 
          c=F(a,c,s/100); 
          n='0% '+a+', '+s+'% '+c+', '+s+'% '+z;
        }else {
          for(i=0; i<l; i++) {c=P(i); 
            s=100*(Math.abs(self.vl[i])/m); 
            if(i==0&&i==(l-1)&&self.lv) {
              z=self.cc; 
              n+=s+'% '+c+', '+s+'% '+z;
            }else if(i==0) {
              n+=s+'% '+c+', ';
            }else if(i==(l-1)&&self.lv) {
              z=self.cc; 
              n+=e+'% '+c+', '+(e+s)+'% '+c+', '+(e+s)+'% '+z;
            }else if(i==(l-1)) {
              n+=e+'% '+c;
            }else {
              n+=e+'% '+c+', '+(e+s)+'% '+c+', ';
            }
            e+=s;
          }
        }
        fyll+='<v:fill color="'+a+'" color2="'+z+'" type="gradient" colors="'+n+'" method="linear" angle="'+(v?0:270)+'" on="t" /></v:roundrect>';
        if(v) {
          flex+='<v:fill color="'+(self.lv&&Math.abs(self.vl[0])<=0?self.cc:P(0))+'" on="t" /></v:shape>';
        }else{
          flex+='<v:fill color="'+a+'" color2="'+z+'" type="gradient" colors="'+n+'" method="linear" angle="'+(v?0:270)+'" on="t" /></v:shape>';
        }
      }else {
        c=self.bu?P(0):self.cc; 
        fyll+='<v:fill color="'+c+'" on="t" /></v:roundrect>'; 
        flex+='<v:fill color="'+c+'" on="t" /></v:shape>';
      }
      if(!self.ns) {
        a=''; 
        z=''; 
        if(v) {
          for(i=0; i<k; i++) {
            a+=' m 100,'+parseInt((h*100)-(b*100)-(i*(b*100))+100)+' l '+parseInt((w*100)-100)+','+parseInt((h*100)-(b*100)-(i*(b*100))+100)+' e'; 
            z+=' m 100,'+parseInt((h*100)-(b*100)-(i*(b*100)))+' l '+parseInt((w*100)-100)+','+parseInt((h*100)-(b*100)-(i*(b*100)))+' e';
          }
        }else {
          for(i=0; i<k; i++) {
            a+=' m '+parseInt((b*100)+(i*(b*100))+100)+',100 l '+parseInt((b*100)+(i*(b*100))+100)+','+parseInt((h*100)-100)+' e'; 
            z+=' m '+parseInt((b*100)+(i*(b*100)))+',100 l '+parseInt((b*100)+(i*(b*100)))+','+parseInt((h*100)-100)+' e';
          }
        }
        scalb='<v:shape coordorigin="0,0" coordsize="'+(w*100)+','+(h*100)+'" path="'+a+'" style="width:'+w+'px;height:'+h
            +'px;left:0px;top:0px;position:absolute;display:block;margin:0px;padding:0px;" filled="f" stroked="t"><v:stroke '
            +'color="white" opacity="0.33" weight="0.1pt" miterlimit="0" endcap="round" /></v:shape>';
        scald='<v:shape coordorigin="0,0" coordsize="'+(w*100)+','+(h*100)+'" path="'+z+'" style="width:'+w+'px;height:'+h
            +'px;left:0px;top:0px;position:absolute;display:block;margin:0px;padding:0px;" filled="f" stroked="t"><v:stroke '
            +'color="black" opacity="0.2" weight="0.1pt" miterlimit="0" endcap="round" /></v:shape>';
      }
      self.innerHTML=head+flex+fyll+scalb+scald+shadb+shadd+foot;
      if(self.bu) {
        a=document.getElementById(self.id+'_flex').firstChild; 
        z=document.getElementById(self.id+'_fyll').firstChild; 
        j=0; 
        t=0; 
        self.timer=window.setInterval(function() {
          c=F(P(0),P(1),j/10); 
          a.color=c; 
          z.color=c; 
          t==1?j--:j++; 
          if(j>10&&t==0){
            j--; 
            t=1;
          } if(j<0&&t==1){
            j++; t=0;
          }
        }
        ,self.pl);
      }
    }else if(self.tagName.toUpperCase()=="CANVAS"&&self.getContext("2d")) {
      self.ctx=self.getContext("2d");
      function fill(x,y,w,h) {
        if(self.wk4) {
          self.ctx.beginPath(); 
          self.ctx.rect(x,y,w,h); 
          self.ctx.closePath(); 
          self.ctx.fill();
        }else {
          self.ctx.fillRect(x,y,w,h);
        }
      };
      function paint(j) {
        self.ctx.clearRect(0,0,self.width,self.height); 
        g=self.ctx.createLinearGradient(0,0,(v?w:0),(v?0:h)); 
        g.addColorStop(0,'rgba(255,255,255,0.75)'); 
        g.addColorStop(0.05,'rgba(255,255,255,0.5)'); 
        g.addColorStop(0.5,'rgba(127,127,127,0.4)'); 
        g.addColorStop(0.95,'rgba(0,0,0,0.55)'); 
        g.addColorStop(1,'rgba(0,0,0,'+(v?0.66:0.8)+')'); 
        self.ctx.lineWidth=0.25; 
        self.ctx.lineCap='butt'; 
        self.ctx.save(); 
        self.ctx.beginPath(); 
        self.ctx.moveTo(0,h-q); 
        self.ctx.quadraticCurveTo(0,h,q,h); 
        self.ctx.quadraticCurveTo(0,h,0,h+q); 
        self.ctx.lineTo(0,h+r); 
        self.ctx.lineTo(w,h+r); 
        self.ctx.lineTo(w,h+q); 
        self.ctx.quadraticCurveTo(w,h,w-q,h); 
        self.ctx.quadraticCurveTo(w,h,w,h-q); 
        self.ctx.lineTo(w,q); 
        self.ctx.quadraticCurveTo(w,0,w-q,0); 
        self.ctx.lineTo(q,0); 
        self.ctx.quadraticCurveTo(0,0,0,q); 
        self.ctx.closePath(); 
        self.ctx.clip();
        if(self.ge8) {
          self.ctx.fillStyle="rgba(0,0,0,0)"; 
          self.ctx.fillRect(0,0,self.width,self.height);
        }
        if(self.bu) {
          a=F(P(0),P(1),j/10,true); 
          self.ctx.fillStyle="rgba("+a+",1)"; 
          fill(0,0,self.width,self.height);
        }else if(self.vl) {
          l=self.vl.length-(self.lv&&self.vl.length>=2?1:0); 
          for(i=0; i<l; i++) {
            m+=Math.abs(self.vl[i]);
          } 
          m=Math.max(m,Math.abs(self.vl[self.vl.length-1]));
          if(self.lv&&self.gr&&l==1) {
            s=(v?h:w)*(Math.abs(self.vl[0])/m); 
            a=P(0); 
            z=P(1); 
            c=self.ctx.createLinearGradient(0,0,(v?0:w),(v?h:0)); 
            c.addColorStop((v?1:0),'rgba('+hex2rgb(a)+',1)'); 
            c.addColorStop((v?0:1),'rgba('+hex2rgb(z)+',1)'); 
            x=x+e; 
            y=h-s; 
            e=s; 
            self.ctx.fillStyle=c; 
            if(v) {fill(0,y,w,s);
            }else {
              fill(x,0,s,self.height);
            }
          }else {
            if(v) {
              y=h; 
              for(i=0; i<l; i++) {
                c=P(i); 
                s=h*(Math.abs(self.vl[i])/m); 
                y=y-s; 
                e=s; 
                self.ctx.fillStyle=c; 
                fill(0,y,w,s);
              }
            }else {
              for(i=0; i<l; i++) {
                c=P(i); 
                s=w*(Math.abs(self.vl[i])/m); 
                x=x+e; 
                e=s; 
                self.ctx.fillStyle=c; 
                fill(x,0,s,self.height);
              }
            }
          }
          if((v&&y>0.25)||(!v&&(x+s)<w)) {
            x=x+e; 
            s=w-x; 
            self.ctx.fillStyle="rgba("+self.dc+","+(window.opera?1.0:self.op)+")"; 
            if(v) {
              fill(0,0,w,y);
            }else {
              fill(x,0,s,self.height);
            }
          }
          if(v) {
            self.ctx.fillStyle="rgba("+(self.lv&&Math.abs(self.vl[0])<=0?self.dc:hex2rgb(P(0)))+","+(window.opera?1.0:self.op)+")"; 
            fill(0,h,w,w);
          }
        }else {
          self.ctx.fillStyle="rgba("+self.dc+","+(window.opera?1.0:self.op)+")"; 
          fill(0,0,self.width,self.height);
        }
        self.ctx.fillStyle=g; fill(0,0,w,h); 
        if(!self.ns) {
          g=self.ctx.createLinearGradient((v?0.5:0),(v?0:0.5),(v?w:0),(v?0:h)); 
          g.addColorStop(0,"rgba(254,254,254,1)"); 
          g.addColorStop(0.66,"rgba(254,254,254,0.8)"); 
          g.addColorStop(1,"rgba(254,254,254,0)");
          if(v) {
            for(i=0; i<k; i++) {
              self.ctx.beginPath(); 
              self.ctx.moveTo(.5,h-(b+(i*b)+.5)); 
              self.ctx.lineTo(w,h-(b+(i*b)+.5)); 
              self.ctx.strokeStyle='rgba(0,0,0,0.75)'; 
              self.ctx.stroke(); 
              self.ctx.beginPath(); 
              self.ctx.moveTo(.5,h-(b+(i*b))); 
              self.ctx.lineTo(w,h-(b+(i*b))); 
              self.ctx.strokeStyle=g; self.ctx.stroke();
            }
          }else {
            for(i=0; i<k; i++) {
              self.ctx.beginPath(); self.ctx.moveTo(b+(i*b),.5); 
              self.ctx.lineTo(b+(i*b),h+(window.opera?0:r)); 
              self.ctx.strokeStyle='rgba(0,0,0,0.75)'; 
              self.ctx.stroke(); 
              self.ctx.beginPath(); 
              self.ctx.moveTo(b+(i*b)+.5,.5); 
              self.ctx.lineTo(b+(i*b)+.5,h); 
              self.ctx.strokeStyle=g; self.ctx.stroke();
            }
          }
        }
        g=self.ctx.createLinearGradient(0,h,0,h+r); 
        g.addColorStop(0,"rgba(0,0,0,1)"); 
        g.addColorStop(0.1,"rgba(0,0,0,0.5)"); 
        g.addColorStop(0.5,"rgba(0,0,0,0)"); 
        g.addColorStop(1,"rgba(0,0,0,0)");
        self.ctx.fillStyle=g; 
        fill(0,h,w,h+r); 
        self.ctx.globalCompositeOperation=(window.opera?"xor":"destination-out"); 
        g=self.ctx.createLinearGradient(0,h,0,h+r); 
        g.addColorStop(1,"rgba(0,0,0,1.0)"); 
        g.addColorStop(0,"rgba(0,0,0,"+self.ty+")");
        self.ctx.fillStyle=g; 
        fill(0,h,w,h+r); 
        self.ctx.restore();
      }; 
      if(self.bu) {
        j=0; t=0; 
        self.timer=window.setInterval(function() {
          paint(j); 
          t==1?j--:j++; 
          if(j>10&&t==0){
            j--; t=1;
          } 
          if(j<0&&t==1){
            j++; t=0;
          }
        },self.pl);
      }else{
        paint();
      }
    } 
  }
  return false;
}
});
//Inputer is a textarea for input text
var Inputer = Class.extend({
  /**
   * [init init Inputer: create a textarea and bindevent]
   * @param  {[type]} name_ [textarea's name]
   * @return {[type]}       [description]
   */
  init: function(name_) {
    if(typeof name_ === 'undefined') throw 'Desktop Inputer need a name!!';
    this._options = {
      left: '0',
      top: '0',
      width: '100',
      height: '32'
    };
    this._name = name_;
    _this = this;
    this.$input = $('<textarea>', {
      // 'type': 'text',
      'name': name_,
    }).css({
      'z-index': '9999',
      'display': 'none',
      'position': 'absolute',
      'font-size': 'small',
      'white-space': 'pre',
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      'resize': 'none',
      'overflow-y': 'hidden'
    });
    $('body').append(this.$input);

    _this.bindEvent(_this);
  },

  /**
   * [bindEvent bindEvent about textarea]
   * @param  {[type]} this_ [this obj]
   * @return {[type]}       [description]
   */
  bindEvent:function(this_){
    var _this = this_;
    $(document).on('mousedown', 'html', function(e) {
      _this.hide();
    }).on('contextmenu', 'html', function(e) {
      _this.hide();
    }).on('mousedown', '[name=' + _this._name + ']', function(e) {
      _this.$input[0].focus();
      _this.$input[0].select();
      e.stopPropagation();
    });

    window.addEventListener('blur',function(){
      _this.hide();
    },false);

    _this.$input.keyup(function(e) {
      if(e.which == 13) {//enter
        if(_this.$input.val() == '\n')
          _this.$input.hide();
        else 
          _this.hide();
      }
      if(e.which == 27) {//esc
          _this.$input.hide();
      }
      e.stopPropagation();
    }).keydown(function(e){
      e.stopPropagation();
    });
  },

  /**
   * [show show the Inputer follow options_]
   * @param  {[type]} options_ [options of textarea include: pos, size, oldtext, callback ]
   * @return {[type]}          [description]
   */
  show: function(options_) {
    if(typeof options_.callback !== 'function') {
      throw 'bad type of callback';
    }

    for(var key in options_) {
      this._options[key] = options_[key];
    }
    this.$input.css({
      'left': this._options.left,
      'top': this._options.top,
      'width': this._options.width,
      'height': this._options.height 
    });
    this.$input.val(this._options.oldtext).show();
    this.$input[0].focus();
    this.$input[0].select();
  },
  
  /**
   * [hide call the callback and hide the input]
   * @return {[type]} [description]
   */
  hide: function() {
    if(this._options.callback)
      this._options.callback.call(this, this.$input.val().replace(/\n/g, ''));
      this._options.callback = null;
      this.$input.hide();
  }
});

/*! messenger 1.4.1 */
/*
 * This file begins the output concatenated into messenger.js
 *
 * It establishes the Messenger object while preserving whatever it was before
 * (for noConflict), and making it a callable function.
 */

(function() {
  var _prevMessenger = window.Messenger;
  var localMessenger;

  localMessenger = window.Messenger = function() {
    return localMessenger._call.apply(this, arguments);
  }

  window.Messenger.noConflict = function() {
    window.Messenger = _prevMessenger;

    return localMessenger;
  }
})();

////***********add Message interface ********////
var Messenge = Class.extend({
  init: function() {
    this.messenger = window.Messenger._call.apply(this, arguments);
  },

  post: function() {
    this.messenger.post(arguments[0]);
  },

  run: function() {
    var length = arguments.length;
    switch (length) {
    case 0:
      this.messenger.run();
      break;
    case 1:
      this.messenger.run(arguments[0]);
      break;
    case 2:
      this.messenger.run(arguments[0], arguments[1]);
      break;
    case 3:
      this.messenger.run(arguments[0], arguments[1], arguments[2]);
      break;
    }
  },

  update: function(opts_) {
    this.messenger.update(opts_);
  },

  cancel: function() {
    this.messenger.hide();
  },

  hide: function() {
    this.messenger.hide();
  },

  hideAll: function() {
    this.messenger.hideAll();
  },

  setOptions: function(opts_) {
    window.Messenger.options = opts_;
  }
});

/*
 * This file contains shims for when Underscore and Backbone
 * are not included.
 *
 * Portions taken from Underscore.js and Backbone.js
 * Both of which are Copyright (c) 2009-2013 Jeremy Ashkenas, DocumentCloud
 */
window.Messenger._ = (function() {
  if (window._) return window._

  var ArrayProto = Array.prototype,
  ObjProto = Object.prototype,
  FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
  slice = ArrayProto.slice,
  concat = ArrayProto.concat,
  toString = ObjProto.toString,
  hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeForEach = ArrayProto.forEach,
  nativeMap = ArrayProto.map,
  nativeReduce = ArrayProto.reduce,
  nativeReduceRight = ArrayProto.reduceRight,
  nativeFilter = ArrayProto.filter,
  nativeEvery = ArrayProto.every,
  nativeSome = ArrayProto.some,
  nativeIndexOf = ArrayProto.indexOf,
  nativeLastIndexOf = ArrayProto.lastIndexOf,
  nativeIsArray = Array.isArray,
  nativeKeys = Object.keys,
  nativeBind = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = {};

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0,
      l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  _.once = function(func) {
    var ran = false,
    memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id: id;
  };

  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj,
    function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'],
  function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  _.defaults = function(obj) {
    each(slice.call(arguments, 1),
    function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  _.extend = function(obj) {
    each(slice.call(arguments, 1),
    function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  _.keys = nativeKeys ||
  function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  _.bind = function(func, context) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(context, args.concat(slice.call(arguments)));
    };
  };

  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  return _;
})();

window.Messenger.Events = (function() {
  if (window.Backbone && Backbone.Events) {
    return Backbone.Events;
  }

  var eventsShim = function() {
    var eventSplitter = /\s+/;

    var eventsApi = function(obj, action, name, rest) {
      if (!name) return true;
      if (typeof name === 'object') {
        for (var key in name) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
      } else if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0,
        l = names.length; i < l; i++) {
          obj[action].apply(obj, [names[i]].concat(rest));
        }
      } else {
        return true;
      }
    };

    var triggerEvents = function(events, args) {
      var ev, i = -1,
      l = events.length;
      switch (args.length) {
      case 0:
        while (++i < l)(ev = events[i]).callback.call(ev.ctx);
        return;
      case 1:
        while (++i < l)(ev = events[i]).callback.call(ev.ctx, args[0]);
        return;
      case 2:
        while (++i < l)(ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
        return;
      case 3:
        while (++i < l)(ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
        return;
      default:
        while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
      }
    };

    var Events = {

      on: function(name, callback, context) {
        if (! (eventsApi(this, 'on', name, [callback, context]) && callback)) return this;
        this._events || (this._events = {});
        var list = this._events[name] || (this._events[name] = []);
        list.push({
          callback: callback,
          context: context,
          ctx: context || this
        });
        return this;
      },

      once: function(name, callback, context) {
        if (! (eventsApi(this, 'once', name, [callback, context]) && callback)) return this;
        var self = this;
        var once = _.once(function() {
          self.off(name, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        this.on(name, once, context);
        return this;
      },

      off: function(name, callback, context) {
        var list, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
          this._events = {};
          return this;
        }

        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
          name = names[i];
          if (list = this._events[name]) {
            events = [];
            if (callback || context) {
              for (j = 0, k = list.length; j < k; j++) {
                ev = list[j];
                if ((callback && callback !== ev.callback && callback !== ev.callback._callback) || (context && context !== ev.context)) {
                  events.push(ev);
                }
              }
            }
            this._events[name] = events;
          }
        }

        return this;
      },

      trigger: function(name) {
        if (!this._events) return this;
        var args = Array.prototype.slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
      },

      listenTo: function(obj, name, callback) {
        var listeners = this._listeners || (this._listeners = {});
        var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
        listeners[id] = obj;
        obj.on(name, typeof name === 'object' ? this: callback, this);
        return this;
      },

      stopListening: function(obj, name, callback) {
        var listeners = this._listeners;
        if (!listeners) return;
        if (obj) {
          obj.off(name, typeof name === 'object' ? this: callback, this);
          if (!name && !callback) delete listeners[obj._listenerId];
        } else {
          if (typeof name === 'object') callback = this;
          for (var id in listeners) {
            listeners[id].off(name, callback, this);
          }
          this._listeners = {};
        }
        return this;
      }
    };

    Events.bind = Events.on;
    Events.unbind = Events.off;
    return Events;
  };
  return eventsShim();
})();

(function() {
  var $, ActionMessenger, BaseView, Events, RetryingMessage, _, _Message, _Messenger, _ref, _ref1, _ref2, __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) {
    for (var key in parent) {
      if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  },
  __slice = [].slice,
  __indexOf = [].indexOf ||
  function(item) {
    for (var i = 0,
    l = this.length; i < l; i++) {
      if (i in this && this[i] === item) return i;
    }
    return - 1;
  };

  $ = jQuery;

  _ = (_ref = window._) != null ? _ref: window.Messenger._;

  Events = (_ref1 = typeof Backbone !== "undefined" && Backbone !== null ? Backbone.Events: void 0) != null ? _ref1: window.Messenger.Events;

  BaseView = (function() {

    function BaseView(options) {
      $.extend(this, Events);
      if (_.isObject(options)) {
        if (options.el) {
          this.setElement(options.el);
        }
        this.model = options.model;
      }
      this.initialize.apply(this, arguments);
    }

    BaseView.prototype.setElement = function(el) {
      this.$el = $(el);
      return this.el = this.$el[0];
    };

    BaseView.prototype.delegateEvents = function(events) {
      var delegateEventSplitter, eventName, key, match, method, selector, _results;
      if (! (events || (events = _.result(this, "events")))) {
        return;
      }
      this.undelegateEvents();
      delegateEventSplitter = /^(\S+)\s*(.*)$/;
      _results = [];
      for (key in events) {
        method = events[key];
        if (!_.isFunction(method)) {
          method = this[events[key]];
        }
        if (!method) {
          throw new Error("Method \"" + events[key] + "\" does not exist");
        }
        match = key.match(delegateEventSplitter);
        eventName = match[1];
        selector = match[2];
        method = _.bind(method, this);
        eventName += ".delegateEvents" + this.cid;
        if (selector === '') {
          _results.push(this.jqon(eventName, method));
        } else {
          _results.push(this.jqon(eventName, selector, method));
        }
      }
      return _results;
    };

    BaseView.prototype.jqon = function(eventName, selector, method) {
      var _ref2;
      if (this.$el.on != null) {
        return (_ref2 = this.$el).on.apply(_ref2, arguments);
      } else {
        if (! (method != null)) {
          method = selector;
          selector = void 0;
        }
        if (selector != null) {
          return this.$el.delegate(selector, eventName, method);
        } else {
          return this.$el.bind(eventName, method);
        }
      }
    };

    BaseView.prototype.jqoff = function(eventName) {
      var _ref2;
      if (this.$el.off != null) {
        return (_ref2 = this.$el).off.apply(_ref2, arguments);
      } else {
        this.$el.undelegate();
        return this.$el.unbind(eventName);
      }
    };

    BaseView.prototype.undelegateEvents = function() {
      return this.jqoff(".delegateEvents" + this.cid);
    };

    BaseView.prototype.remove = function() {
      this.undelegateEvents();
      return this.$el.remove();
    };

    return BaseView;

  })();

  _Message = (function(_super) {

    __extends(_Message, _super);

    function _Message() {
      return _Message.__super__.constructor.apply(this, arguments);
    }

    _Message.prototype.defaults = {
      hideAfter: 10,
      scroll: true,
      closeButtonText: "&times;"
    };

    _Message.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.shown = false;
      this.rendered = false;
      this.messenger = opts.messenger;
      return this.options = $.extend({},
      this.options, opts, this.defaults);
    };

    _Message.prototype.show = function() {
      var wasShown;
      if (!this.rendered) {
        this.render();
      }
      this.$message.removeClass('messenger-hidden');
      wasShown = this.shown;
      this.shown = true;
      if (!wasShown) {
        return this.trigger('show');
      }
    };

    _Message.prototype.hide = function() {
      var wasShown;
      if (!this.rendered) {
        return;
      }
      this.$message.addClass('messenger-hidden');
      wasShown = this.shown;
      this.shown = false;
      if (wasShown) {
        return this.trigger('hide');
      }
    };

    _Message.prototype.cancel = function() {
      return this.hide();
    };

    _Message.prototype.update = function(opts) {
      var _ref2, _this = this;
      if (_.isString(opts)) {
        opts = {
          message: opts
        };
      }
      $.extend(this.options, opts);
      this.lastUpdate = new Date();
      this.rendered = false;
      this.events = (_ref2 = this.options.events) != null ? _ref2: {};
      this.render();
      this.actionsToEvents();
      this.delegateEvents();
      this.checkClickable();
      if (this.options.hideAfter) {
        this.$message.addClass('messenger-will-hide-after');
        if (this._hideTimeout != null) {
          clearTimeout(this._hideTimeout);
        }
        this._hideTimeout = setTimeout(function() {
          return _this.hide();
        },
        this.options.hideAfter * 1000);
      } else {
        this.$message.removeClass('messenger-will-hide-after');
      }
      if (this.options.hideOnNavigate) {
        this.$message.addClass('messenger-will-hide-on-navigate');
        if ((typeof Backbone !== "undefined" && Backbone !== null ? Backbone.history: void 0) != null) {
          Backbone.history.on('route',
          function() {
            return _this.hide();
          });
        }
      } else {
        this.$message.removeClass('messenger-will-hide-on-navigate');
      }
      return this.trigger('update', this);
    };

    _Message.prototype.scrollTo = function() {
      if (!this.options.scroll) {
        return;
      }
      return $.scrollTo(this.$el, {
        duration: 400,
        offset: {
          left: 0,
          top: -20
        }
      });
    };

    _Message.prototype.timeSinceUpdate = function() {
      if (this.lastUpdate) {
        return (new Date) - this.lastUpdate;
      } else {
        return null;
      }
    };

    _Message.prototype.actionsToEvents = function() {
      var act, name, _ref2, _results, _this = this;
      _ref2 = this.options.actions;
      _results = [];
      for (name in _ref2) {
        act = _ref2[name];
        _results.push(this.events["click [data-action=\"" + name + "\"] a"] = (function(act) {
          return function(e) {
            e.preventDefault();
            e.stopPropagation();
            _this.trigger("action:" + name, act, e);
            return act.action.call(_this, e, _this);
          };
        })(act));
      }
      return _results;
    };

    _Message.prototype.checkClickable = function() {
      var evt, name, _ref2, _results;
      _ref2 = this.events;
      _results = [];
      for (name in _ref2) {
        evt = _ref2[name];
        if (name === 'click') {
          _results.push(this.$message.addClass('messenger-clickable'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    _Message.prototype.undelegateEvents = function() {
      var _ref2;
      _Message.__super__.undelegateEvents.apply(this, arguments);
      return (_ref2 = this.$message) != null ? _ref2.removeClass('messenger-clickable') : void 0;
    };

    _Message.prototype.parseActions = function() {
      var act, actions, n_act, name, _ref2, _ref3;
      actions = [];
      _ref2 = this.options.actions;
      for (name in _ref2) {
        act = _ref2[name];
        n_act = $.extend({},
        act);
        n_act.name = name;
        if ((_ref3 = n_act.label) == null) {
          n_act.label = name;
        }
        actions.push(n_act);
      }
      return actions;
    };

    _Message.prototype.template = function(opts) {
      var $action, $actions, $cancel, $link, $message, $text, action, _i, _len, _ref2, _this = this;
      $message = $("<div class='messenger-message message alert " + opts.type + " message-" + opts.type + " alert-" + opts.type + "'>");
      if (opts.showCloseButton) {
        $cancel = $('<button type="button" class="messenger-close" data-dismiss="alert">');
        $cancel.html(opts.closeButtonText);
        $cancel.click(function() {
          _this.cancel();
          return true;
        });
        $message.append($cancel);
      }
      $text = $("<div class=\"messenger-message-inner\">" + opts.message + "</div>");
      $message.append($text);
      if (opts.actions.length) {
        $actions = $('<div class="messenger-actions">');
      }
      _ref2 = opts.actions;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        action = _ref2[_i];
        $action = $('<span>');
        $action.attr('data-action', "" + action.name);
        $link = $('<a>');
        $link.html(action.label);
        $action.append($('<span class="messenger-phrase">'));
        $action.append($link);
        $actions.append($action);
      }
      $message.append($actions);
      return $message;
    };

    _Message.prototype.render = function() {
      var opts;
      if (this.rendered) {
        return;
      }
      if (!this._hasSlot) {
        this.setElement(this.messenger._reserveMessageSlot(this));
        this._hasSlot = true;
      }
      opts = $.extend({},
      this.options, {
        actions: this.parseActions()
      });
      this.$message = $(this.template(opts));
      this.$el.html(this.$message);
      this.shown = true;
      this.rendered = true;
      return this.trigger('render');
    };

    return _Message;

  })(BaseView);

  RetryingMessage = (function(_super) {

    __extends(RetryingMessage, _super);

    function RetryingMessage() {
      return RetryingMessage.__super__.constructor.apply(this, arguments);
    }

    RetryingMessage.prototype.initialize = function() {
      RetryingMessage.__super__.initialize.apply(this, arguments);
      return this._timers = {};
    };

    RetryingMessage.prototype.cancel = function() {
      this.clearTimers();
      this.hide();
      if ((this._actionInstance != null) && (this._actionInstance.abort != null)) {
        return this._actionInstance.abort();
      }
    };

    RetryingMessage.prototype.clearTimers = function() {
      var name, timer, _ref2, _ref3;
      _ref2 = this._timers;
      for (name in _ref2) {
        timer = _ref2[name];
        clearTimeout(timer);
      }
      this._timers = {};
      return (_ref3 = this.$message) != null ? _ref3.removeClass('messenger-retry-soon messenger-retry-later') : void 0;
    };

    RetryingMessage.prototype.render = function() {
      var action, name, _ref2, _results;
      RetryingMessage.__super__.render.apply(this, arguments);
      this.clearTimers();
      _ref2 = this.options.actions;
      _results = [];
      for (name in _ref2) {
        action = _ref2[name];
        if (action.auto) {
          _results.push(this.startCountdown(name, action));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    RetryingMessage.prototype.renderPhrase = function(action, time) {
      var phrase;
      phrase = action.phrase.replace('TIME', this.formatTime(time));
      return phrase;
    };

    RetryingMessage.prototype.formatTime = function(time) {
      var pluralize;
      pluralize = function(num, str) {
        num = Math.floor(num);
        if (num !== 1) {
          str = str + 's';
        }
        return 'in ' + num + ' ' + str;
      };
      if (Math.floor(time) === 0) {
        return 'now...';
      }
      if (time < 60) {
        return pluralize(time, 'second');
      }
      time /= 60;
      if (time < 60) {
        return pluralize(time, 'minute');
      }
      time /= 60;
      return pluralize(time, 'hour');
    };

    RetryingMessage.prototype.startCountdown = function(name, action) {
      var $phrase, remaining, tick, _ref2, _this = this;
      if (this._timers[name] != null) {
        return;
      }
      $phrase = this.$message.find("[data-action='" + name + "'] .messenger-phrase");
      remaining = (_ref2 = action.delay) != null ? _ref2: 3;
      if (remaining <= 10) {
        this.$message.removeClass('messenger-retry-later');
        this.$message.addClass('messenger-retry-soon');
      } else {
        this.$message.removeClass('messenger-retry-soon');
        this.$message.addClass('messenger-retry-later');
      }
      tick = function() {
        var delta;
        $phrase.text(_this.renderPhrase(action, remaining));
        if (remaining > 0) {
          delta = Math.min(remaining, 1);
          remaining -= delta;
          return _this._timers[name] = setTimeout(tick, delta * 1000);
        } else {
          _this.$message.removeClass('messenger-retry-soon messenger-retry-later');
          delete _this._timers[name];
          return action.action();
        }
      };
      return tick();
    };

    return RetryingMessage;

  })(_Message);

  _Messenger = (function(_super) {

    __extends(_Messenger, _super);

    function _Messenger() {
      return _Messenger.__super__.constructor.apply(this, arguments);
    }

    _Messenger.prototype.tagName = 'ul';

    _Messenger.prototype.className = 'messenger';

    _Messenger.prototype.messageDefaults = {
      type: 'info'
    };

    _Messenger.prototype.initialize = function(options) {
      this.options = options != null ? options: {};
      this.history = [];
      return this.messageDefaults = $.extend({},
      this.messageDefaults, this.options.messageDefaults);
    };

    _Messenger.prototype.render = function() {
      return this.updateMessageSlotClasses();
    };

    _Messenger.prototype.findById = function(id) {
      return _.filter(this.history,
      function(rec) {
        return rec.msg.options.id === id;
      });
    };

    _Messenger.prototype._reserveMessageSlot = function(msg) {
      var $slot, dmsg, _this = this;
      $slot = $('<li>');
      $slot.addClass('messenger-message-slot');
      this.$el.prepend($slot);
      this.history.push({
        msg: msg,
        $slot: $slot
      });
      this._enforceIdConstraint(msg);
      msg.on('update',
      function() {
        return _this._enforceIdConstraint(msg);
      });
      while (this.options.maxMessages && this.history.length > this.options.maxMessages) {
        dmsg = this.history.shift();
        dmsg.msg.remove();
        dmsg.$slot.remove();
      }
      return $slot;
    };

    _Messenger.prototype._enforceIdConstraint = function(msg) {
      var entry, _i, _len, _msg, _ref2;
      if (msg.options.id == null) {
        return;
      }
      _ref2 = this.history;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        entry = _ref2[_i];
        _msg = entry.msg;
        if ((_msg.options.id != null) && _msg.options.id === msg.options.id && msg !== _msg) {
          if (msg.options.singleton) {
            msg.hide();
            return;
          } else {
            _msg.hide();
          }
        }
      }
    };

    _Messenger.prototype.newMessage = function(opts) {
      var msg, _ref2, _ref3, _ref4, _this = this;
      if (opts == null) {
        opts = {};
      }
      opts.messenger = this;
      _Message = (_ref2 = (_ref3 = Messenger.themes[(_ref4 = opts.theme) != null ? _ref4: this.options.theme]) != null ? _ref3.Message: void 0) != null ? _ref2: RetryingMessage;
      msg = new _Message(opts);
      msg.on('show',
      function() {
        if (opts.scrollTo && _this.$el.css('position') !== 'fixed') {
          return msg.scrollTo();
        }
      });
      msg.on('hide show render', this.updateMessageSlotClasses, this);
      return msg;
    };

    _Messenger.prototype.updateMessageSlotClasses = function() {
      var anyShown, last, rec, willBeFirst, _i, _len, _ref2;
      willBeFirst = true;
      last = null;
      anyShown = false;
      _ref2 = this.history;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        rec = _ref2[_i];
        rec.$slot.removeClass('messenger-first messenger-last messenger-shown');
        if (rec.msg.shown && rec.msg.rendered) {
          rec.$slot.addClass('messenger-shown');
          anyShown = true;
          last = rec;
          if (willBeFirst) {
            willBeFirst = false;
            rec.$slot.addClass('messenger-first');
          }
        }
      }
      if (last != null) {
        last.$slot.addClass('messenger-last');
      }
      return this.$el["" + (anyShown ? 'remove': 'add') + "Class"]('messenger-empty');
    };

    _Messenger.prototype.hideAll = function() {
      var rec, _i, _len, _ref2, _results;
      _ref2 = this.history;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        rec = _ref2[_i];
        _results.push(rec.msg.hide());
      }
      return _results;
    };

    _Messenger.prototype.post = function(opts) {
      var msg;
      if (_.isString(opts)) {
        opts = {
          message: opts
        };
      }
      opts = $.extend(true, {},
      this.messageDefaults, opts);
      msg = this.newMessage(opts);
      msg.update(opts);
      return msg;
    };

    return _Messenger;

  })(BaseView);

  ActionMessenger = (function(_super) {

    __extends(ActionMessenger, _super);

    function ActionMessenger() {
      return ActionMessenger.__super__.constructor.apply(this, arguments);
    }

    ActionMessenger.prototype.doDefaults = {
      progressMessage: null,
      successMessage: null,
      errorMessage: "Error connecting to the server.",
      showSuccessWithoutError: true,
      retry: {
        auto: true,
        allow: true
      },
      action: $.ajax
    };

    ActionMessenger.prototype.hookBackboneAjax = function(msgr_opts) {
      var _ajax, _this = this;
      if (msgr_opts == null) {
        msgr_opts = {};
      }
      if (! (window.Backbone != null)) {
        throw 'Expected Backbone to be defined';
      }
      msgr_opts = _.defaults(msgr_opts, {
        id: 'BACKBONE_ACTION',
        errorMessage: false,
        successMessage: "Request completed successfully.",
        showSuccessWithoutError: false
      });
      _ajax = function(options) {
        var sync_msgr_opts;
        sync_msgr_opts = _.extend({},
        msgr_opts, options.messenger);
        return _this["do"](sync_msgr_opts, options);
      };
      if (Backbone.ajax != null) {
        if (Backbone.ajax._withoutMessenger) {
          Backbone.ajax = Backbone.ajax._withoutMessenger;
        }
        if (! (msgr_opts.action != null) || msgr_opts.action === this.doDefaults.action) {
          msgr_opts.action = Backbone.ajax;
        }
        _ajax._withoutMessenger = Backbone.ajax;
        return Backbone.ajax = _ajax;
      } else {
        return Backbone.sync = _.wrap(Backbone.sync,
        function() {
          var args, _old_ajax, _old_sync;
          _old_sync = arguments[0],
          args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          _old_ajax = $.ajax;
          $.ajax = _ajax;
          _old_sync.call.apply(_old_sync, [this].concat(__slice.call(args)));
          return $.ajax = _old_ajax;
        });
      }
    };

    ActionMessenger.prototype._getHandlerResponse = function(returnVal) {
      if (returnVal === false) {
        return false;
      }
      if (returnVal === true || !(returnVal != null)) {
        return true;
      }
      return returnVal;
    };

    ActionMessenger.prototype._parseEvents = function(events) {
      var desc, firstSpace, func, label, out, type, _ref2;
      if (events == null) {
        events = {};
      }
      out = {};
      for (label in events) {
        func = events[label];
        firstSpace = label.indexOf(' ');
        type = label.substring(0, firstSpace);
        desc = label.substring(firstSpace + 1);
        if ((_ref2 = out[type]) == null) {
          out[type] = {};
        }
        out[type][desc] = func;
      }
      return out;
    };

    ActionMessenger.prototype._normalizeResponse = function() {
      var data, elem, resp, type, xhr, _i, _len;
      resp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      type = null;
      xhr = null;
      data = null;
      for (_i = 0, _len = resp.length; _i < _len; _i++) {
        elem = resp[_i];
        if (elem === 'success' || elem === 'timeout' || elem === 'abort') {
          type = elem;
        } else if (((elem != null ? elem.readyState: void 0) != null) && ((elem != null ? elem.responseText: void 0) != null)) {
          xhr = elem;
        } else if (_.isObject(elem)) {
          data = elem;
        }
      }
      return [type, data, xhr];
    };

    ActionMessenger.prototype.run = function() {
      var args, events, getMessageText, handler, handlers, m_opts, msg, old, opts, type, _ref2, _this = this;
      m_opts = arguments[0],
      opts = arguments[1],
      args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (opts == null) {
        opts = {};
      }
      m_opts = $.extend(true, {},
      this.messageDefaults, this.doDefaults, m_opts != null ? m_opts: {});
      events = this._parseEvents(m_opts.events);
      getMessageText = function(type, xhr) {
        var message;
        message = m_opts[type + 'Message'];
        if (_.isFunction(message)) {
          return message.call(_this, type, xhr);
        }
        return message;
      };
      msg = (_ref2 = m_opts.messageInstance) != null ? _ref2: this.newMessage(m_opts);
      if (m_opts.id != null) {
        msg.options.id = m_opts.id;
      }
      if (m_opts.progressMessage != null) {
        msg.update($.extend({},
        m_opts, {
          message: getMessageText('progress', null),
          type: 'info'
        }));
      }
      handlers = {};
      _.each(['error', 'success'],
      function(type) {
        var originalHandler;
        originalHandler = opts[type];
        return handlers[type] = function() {
          var data, defaultOpts, handlerResp, msgOpts, reason, resp, responseOpts, xhr, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
          resp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref3 = _this._normalizeResponse.apply(_this, resp),
          reason = _ref3[0],
          data = _ref3[1],
          xhr = _ref3[2];
          if (type === 'success' && !(msg.errorCount != null) && m_opts.showSuccessWithoutError === false) {
            m_opts['successMessage'] = null;
          }
          if (type === 'error') {
            if ((_ref4 = m_opts.errorCount) == null) {
              m_opts.errorCount = 0;
            }
            m_opts.errorCount += 1;
          }
          handlerResp = m_opts.returnsPromise ? resp[0] : typeof originalHandler === "function" ? originalHandler.apply(null, resp) : void 0;
          responseOpts = _this._getHandlerResponse(handlerResp);
          if (_.isString(responseOpts)) {
            responseOpts = {
              message: responseOpts
            };
          }
          if (type === 'error' && ((xhr != null ? xhr.status: void 0) === 0 || reason === 'abort')) {
            msg.hide();
            return;
          }
          if (type === 'error' && ((m_opts.ignoredErrorCodes != null) && (_ref5 = xhr != null ? xhr.status: void 0, __indexOf.call(m_opts.ignoredErrorCodes, _ref5) >= 0))) {
            msg.hide();
            return;
          }
          defaultOpts = {
            message: getMessageText(type, xhr),
            type: type,
            events: (_ref6 = events[type]) != null ? _ref6: {},
            hideOnNavigate: type === 'success'
          };
          msgOpts = $.extend({},
          m_opts, defaultOpts, responseOpts);
          if (typeof((_ref7 = msgOpts.retry) != null ? _ref7.allow: void 0) === 'number') {
            msgOpts.retry.allow--;
          }
          if (type === 'error' && (xhr != null ? xhr.status: void 0) >= 500 && ((_ref8 = msgOpts.retry) != null ? _ref8.allow: void 0)) {
            if (msgOpts.retry.delay == null) {
              if (msgOpts.errorCount < 4) {
                msgOpts.retry.delay = 10;
              } else {
                msgOpts.retry.delay = 5 * 60;
              }
            }
            if (msgOpts.hideAfter) {
              if ((_ref9 = msgOpts._hideAfter) == null) {
                msgOpts._hideAfter = msgOpts.hideAfter;
              }
              msgOpts.hideAfter = msgOpts._hideAfter + msgOpts.retry.delay;
            }
            msgOpts._retryActions = true;
            msgOpts.actions = {
              retry: {
                label: 'retry now',
                phrase: 'Retrying TIME',
                auto: msgOpts.retry.auto,
                delay: msgOpts.retry.delay,
                action: function() {
                  msgOpts.messageInstance = msg;
                  return setTimeout(function() {
                    return _this["do"].apply(_this, [msgOpts, opts].concat(__slice.call(args)));
                  },
                  0);
                }
              },
              cancel: {
                action: function() {
                  return msg.cancel();
                }
              }
            };
          } else if (msgOpts._retryActions) {
            delete msgOpts.actions.retry;
            delete msgOpts.actions.cancel;
            delete m_opts._retryActions;
          }
          msg.update(msgOpts);
          if (responseOpts && msgOpts.message) {
            Messenger(_.extend({},
            _this.options, {
              instance: _this
            }));
            return msg.show();
          } else {
            return msg.hide();
          }
        };
      });
      if (!m_opts.returnsPromise) {
        for (type in handlers) {
          handler = handlers[type];
          old = opts[type];
          opts[type] = handler;
        }
      }
      msg._actionInstance = m_opts.action.apply(m_opts, [opts].concat(__slice.call(args)));
      if (m_opts.returnsPromise) {
        msg._actionInstance.then(handlers.success, handlers.error);
      }
      return msg;
    };

    ActionMessenger.prototype["do"] = ActionMessenger.prototype.run;

    ActionMessenger.prototype.ajax = function() {
      var args, m_opts;
      m_opts = arguments[0],
      args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      m_opts.action = $.ajax;
      return this.run.apply(this, [m_opts].concat(__slice.call(args)));
    };

    ActionMessenger.prototype.expectPromise = function(action, m_opts) {
      m_opts = _.extend({},
      m_opts, {
        action: action,
        returnsPromise: true
      });
      return this.run(m_opts);
    };

    ActionMessenger.prototype.error = function(m_opts) {
      if (m_opts == null) {
        m_opts = {};
      }
      if (typeof m_opts === 'string') {
        m_opts = {
          message: m_opts
        };
      }
      m_opts.type = 'error';
      return this.post(m_opts);
    };

    ActionMessenger.prototype.info = function(m_opts) {
      if (m_opts == null) {
        m_opts = {};
      }
      if (typeof m_opts === 'string') {
        m_opts = {
          message: m_opts
        };
      }
      m_opts.type = 'info';
      return this.post(m_opts);
    };

    ActionMessenger.prototype.success = function(m_opts) {
      if (m_opts == null) {
        m_opts = {};
      }
      if (typeof m_opts === 'string') {
        m_opts = {
          message: m_opts
        };
      }
      m_opts.type = 'success';
      return this.post(m_opts);
    };

    return ActionMessenger;

  })(_Messenger);

  $.fn.messenger = function() {
    var $el, args, func, instance, opts, _ref2, _ref3, _ref4;
    func = arguments[0],
    args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (func == null) {
      func = {};
    }
    $el = this;
    if (! (func != null) || !_.isString(func)) {
      opts = func;
      if (! ($el.data('messenger') != null)) {
        _Messenger = (_ref2 = (_ref3 = Messenger.themes[opts.theme]) != null ? _ref3.Messenger: void 0) != null ? _ref2: ActionMessenger;
        $el.data('messenger', instance = new _Messenger($.extend({
          el: $el
        },
        opts)));
        instance.render();
      }
      return $el.data('messenger');
    } else {
      return (_ref4 = $el.data('messenger'))[func].apply(_ref4, args);
    }
  };

  window.Messenger._call = function(opts) {
    var $el, $parent, choosen_loc, chosen_loc, classes, defaultOpts, inst, loc, locations, _i, _len;
    defaultOpts = {
      extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right',
      theme: 'future',
      maxMessages: 9,
      parentLocations: ['body']
    };
    opts = $.extend(defaultOpts, $._messengerDefaults, Messenger.options, opts);
    if (opts.theme != null) {
      opts.extraClasses += " messenger-theme-" + opts.theme;
    }
    inst = opts.instance || Messenger.instance;
    if (opts.instance == null) {
      locations = opts.parentLocations;
      $parent = null;
      choosen_loc = null;
      for (_i = 0, _len = locations.length; _i < _len; _i++) {
        loc = locations[_i];
        $parent = $(loc);
        if ($parent.length) {
          chosen_loc = loc;
          break;
        }
      }
      if (!inst) {
        $el = $('<ul>');
        $parent.prepend($el);
        inst = $el.messenger(opts);
        inst._location = chosen_loc;
        Messenger.instance = inst;
      } else if (!$(inst._location).is($(chosen_loc))) {
        inst.$el.detach();
        $parent.prepend(inst.$el);
      }
    }
    if (inst._addedClasses != null) {
      inst.$el.removeClass(inst._addedClasses);
    }
    inst.$el.addClass(classes = "" + inst.className + " " + opts.extraClasses);
    inst._addedClasses = classes;
    return inst;
  };

  $.extend(Messenger, {
    Message: RetryingMessage,
    Messenger: ActionMessenger,
    themes: (_ref2 = Messenger.themes) != null ? _ref2: {}
  });

  $.globalMessenger = window.Messenger = Messenger;

}).call(this);

//theme.
(function() {
  var $, FutureMessage, spinner_template, __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) {
    for (var key in parent) {
      if (__hasProp.call(parent, key)) child[key] = parent[key];
    }
    function ctor() {
      this.constructor = child;
    }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
  };

  $ = jQuery;

  spinner_template = '<div class="messenger-spinner">\n    <span class="messenger-spinner-side messenger-spinner-side-left">\n        <span class="messenger-spinner-fill"></span>\n    </span>\n    <span class="messenger-spinner-side messenger-spinner-side-right">\n        <span class="messenger-spinner-fill"></span>\n    </span>\n</div>';

  FutureMessage = (function(_super) {

    __extends(FutureMessage, _super);

    function FutureMessage() {
      return FutureMessage.__super__.constructor.apply(this, arguments);
    }

    FutureMessage.prototype.template = function(opts) {
      var $message;
      $message = FutureMessage.__super__.template.apply(this, arguments);
      $message.append($(spinner_template));
      return $message;
    };

    return FutureMessage;

  })(window.Messenger.Message);

  window.Messenger.themes.future = {
    Message: FutureMessage
  };

}).call(this);
var ModalBox = Class.extend({
  init:function($obj_, options_){
    this._options = {
      width: 'auto',
      height: 'auto',
      left: 'auto',
      top: 'auto',
      overlay: true,
      iconClose: false,
      keyClose: true,
      bodyClose: true,
      iconImg: 'img/close.png',
      //callback function
      onOpen: function () {},
      onClose: function () {}
    }

    if (options_) {
      for(var key in options_)
      	  this._options[key] = options_[key];
    }; 

    this._obj = $obj_;
    this._width = this._obj.width();
    this._height = this._obj.height();
    this._widthOut = this._obj.outerWidth();
    this._heightOut = this._obj.outerHeight();
    this._winWidth = $(window).width();
    this._winHeight = $(window).height();
    this._setWidth = Math.min(this._widthOut, this._winWidth) - (this._widthOut - this._width);
    this._setHeight = Math.min(this._heightOut, this._winHeight) - (this._heightOut - this._height);

    this._obj.addClass('iw-modalBox');
    this.setOptions();
  },

  setOptions:function(){
    var _this = this;
    if (_this._options.width !== 'auto') {
      _this._obj.css('width', _this._options.width);
    } else {
      _this._obj.width(_this._setWidth);
    }
    if (_this._options.height !== 'auto') {
      _this._obj.css('height',_this._options.height);
    } else {
      _this._obj.height(_this._setHeight);
    }

    var top = '50%',
      left = '50%';
      marginLeft = _this._widthOut / 2;
      marginTop = _this._heightOut / 2;

    if (_this._options.left !== 'auto') {
    	left = _this._options.left;
    	marginLeft = 0;
    }
    if (_this._options.top !== 'auto') {
    	top = _this._options.top;
    	marginTop = 0;
    };

    this._obj.css({
      top: top,
      left: left,
      position: 'fixed',
      display: 'block',
      'margin-left': -marginLeft,
      'margin-top': -marginTop,
      'z-index': '99999'
    });

    if (_this._options.overlay) {
    	_this.addOverlay();
    };

    if (_this._options.iconClose) {
      if ((_this._widthOut < (_this._winWidth)) && (_this._heightOut < _this._winHeight)){
        var randId = Math.ceil(Math.random() * 1000) + 'close';
        var img = $('<img src="' + _this._options.iconImg + '" class="iw-closeImg" id="' + randId + '"/>');
        _this._obj.attr('closeImg',randId);
        img.bind('click',function(){
        	_this.close.call(_this);
        });
        $(window).bind('resize.iw-modalBox',{
          img: img,
          obj: _this._obj
        }, _this.resizeEvent);
        $(window).triggerHandler('resize.iw-modalBox');
        $('body').append(img);
      };
    };

    if (_this._options.keyClose) {
      _this.keyEvent();
    };

    if (_this._options.bodyClose) {
      var overlay = $('.iw-modalOverlay');
      if (overlay.length === 0) {
        addOverlay();
        overlay = $('.iw-modalOverlay');
        overlay.css({
          'background':'none'
        });
      };
      overlay.bind('mousedown',function(){
      	  _this.close.call(_this);
      });
    };

    _this._options.onOpen.call(this);
  },

  close:function(){
    var _this = this;
    if (_this._obj.hasClass('iw-modalBox')) {
      var imgId = _this._obj.attr('closeImg');
      if (imgId) {
        _this._obj.removeAttr('closeImg');
        $('#'+imgId).remove();
      };
      _this._obj.css({
      	  'display': 'none'
      })
      _this._obj.width(_this._width);
      _this._obj.height(_this._height);
      _this._options.onClose.call(_this);
      _this._obj.removeClass('iw-modalBox');
      if ($('.iw-modalBox').length === 0) {
      	  $('.iw-modalOverlay').remove();
      	  $(document).unbind('resize.iw-modalBox');
      };
    };
  },

  keyEvent:function(){
    var _this = this;
    $(document).keydown(function(e){
      var key = e.which;
      if(key === 27){
        _this.close();
      }
    });
  },
  
  addOverlay:function(){
    $('body').append('<div class="iw-modalOverlay"></div>');
    $('.iw-modalOverlay').css({
      display: 'block',
      width: '100%',
      height: '100%',
      position: 'fixed',
      top: 0,
      left: 0,
      'z-index': '1000'
    });
  },

  resizeEvent:function(e){
    var _img = e.data.img,
      _obj = e.data.obj;
    _img.css({
      top: (_obj.offset().top - $(window).scrollTop() - 8) + 'px',
      left: (_obj.offset().left - $(window).scrollTop() + _obj.width() - 8) + 'px',
      position: 'fixed',
      'z-index': '99999'
    });
  }
});
//this ui is for reflection for img
var Reflection = Class.extend({
  /**
   * [init init reflection]
   * @param  {[js obj]} img_     [img]
   * @param  {[json]} options_ [include: height ratio and opacity ratio]
   * @return {[type]}          [description]
   */
  init:function(img_, options_){
    if (typeof img_ === 'undefined'|| img_.tagName !== 'IMG') {
      console.log('input img error');
      return ;
    };
   this._options = {
      height : 0.5,
      opacity : 0.5,
      hasParentDiv: false
    };
    this._img = $(img_);

    if (options_) {
      for(var key in options_) {
       this._options[key] = options_[key];
      }
    };
  },

  /**
   * [add add reflection follow this._img and this._options]
   */
  add:function(){
    var _this = this;
    try{
    	  var _parentDiv = _this._img.parent('div');
    	  if (_this._options.hasParentDiv === false || typeof _parentDiv[0] === 'undefined' ) {
    	    _parentDiv = $('<div>', {
    	      'class': 'reflect'
    	    });
    	    _this._img[0].parentNode.replaceChild(_parentDiv[0], _this._img[0]);
    	    _parentDiv.append(_this._img);

    	    var _classes = _this._img[0].className.split(' '); 
    	    var _newClasses = '';
    	    for (var i = _classes.length - 1; i >= 0; i--) {
    	  	  if(_classes[i] !== 'reflect'){
    	  		  if (_newClasses) {
    	  			  _newClasses += ' ';
    	  		  };
    	  		  _newClasses += _classes[i];
    	  	  }
    	    };

    	    if (_newClasses) {
    	        _parentDiv.addClass(_newClasses);
    	    };
    	  }else{
    	    if (!_parentDiv.hasClass('reflect')){
    	    	  _parentDiv.addClass('reflect');
    	    } ;
    	  }
    	  //put img's css into img's parentDiv
    	  //_parentDiv[0].style.cssText = _this._img[0].style.cssText;
        // ERROR: Will introduce a mouse move bug!!!
        _parentDiv[0].style.width = _this._img[0].style.width;
    	  //set vertical align
    	  _this._img[0].style.cssText = 'vertical-align: bottom';
    	  //set reflect height and reflect width
    	  var _reflectHeight = Math.floor(_this._img.height() * _this._options['height']);
    	  var _reflectWidth = _this._img.width();
    	  //if ie 
    	  if (document.all && !window.opera) {
    	    var _reflection = document.createElement('img');
    	    _reflection.src = _this._img[0].src;
    	    _reflection.style.width = _this._img.width() + 'px';
          // ERROR: Will introduce a mouse move bug!!!
          _reflection.style.display = 'inline-block';
    	    _reflection.style.height = _reflectHeight;
    	    _reflection.style.marginBottom = "-"+(p.height-_reflectHeight)+'px';
    	    _reflection.style.filter = 'flipv progid:DXImageTransform.Microsoft.Alpha(opacity='
    	        + (options['opacity']*100)
    	        + ', style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy='
    	        + (options['height']*100)+')';
         _parentDiv.append(_reflection);
    	  } else {
    	    var _canvas = document.createElement('canvas');
    	    if (_canvas.getContext) {
    	      var _context = _canvas.getContext('2d');
    	    	  _canvas.style.height = _reflectHeight + 'px';
    	      _canvas.style.width = _this._img.width() + 'px';
    	      _canvas.height = _reflectHeight;
    	      _canvas.width = _this._img.width();
            // ERROR: Will introduce a mouse move bug!!!
             _parentDiv[0].style.width = _reflectWidth + 'px';
    	      //_parentDiv[0].style.height = _this._img.height()+ _reflectHeight + 'px';
    	      _parentDiv.append(_canvas);
    	      _context.save();
    	      _context.translate(0,_this._img.height()-1);
    	      _context.scale(1,-1);
    	      _context.drawImage(_this._img[0], 0, 0, _this._img.width(), _this._img.height());
    	      _context.restore();
    	      _context.globalCompositeOperation = "destination-out";
    	      var _gradient = _context.createLinearGradient(0, 0, 0, _reflectHeight);
    	      _gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
    	      _gradient.addColorStop(0, "rgba(255, 255, 255, "+(1-_this._options['opacity'])+")");
    	 
    	      _context.fillStyle = _gradient;
    	      _context.rect(0, 0, _reflectWidth, _reflectHeight*2);
    	      _context.fill();
    	    };
    	  }
    }catch (e){
    	  console.log(e);
    }
  },

  /**
   * [remove remove reflect]
   * @return {[type]} [description]
   */
  remove:function(){
    var _this = this;
    var _parentDiv = $(_this._img[0].parentNode);
    _parentDiv.removeClass('reflect');
    if (document.all && !window.opera) {
    	  var _imgs = _parentDiv.children('div');
    	  _imgs.style.cssText = '';
    	  if (typeof _imgs[1] !== 'undefined') {
    	    _imgs[1].remove();
    	  }
    }else{
    	 var _canvas = _parentDiv.children('canvas');
    	 if (typeof _canvas !== 'undefined') {
    	 	_canvas.remove();
    	 };
    }
  }
});

var Tab = Class.extend({
  init:function(_id, _tabs, _pos, _size){
    if (!(_id && _tabs)) {
      console.log("id and json can't be null");
      return;
    };
    this._top = '0px';
    this._left = '0px';
    this._width = '100%';
    this._height = '100%';

    if (_pos) {
      this._top = _pos.top;
      this._left = _pos.left; 
    };

    if (_size) {
      this._width = _size._width;
      this._height = _size._height;
    };

    this._tabShow = $("<div>",{
      "class": 'tab-show'
    });

    this._tabDiv = $("<div>",{
      "class": 'tab-div'
    });
    this._tabShow.append(this._tabDiv);

    for (var i = 0; i < _tabs.length; i++) {
      var _id = "tab-"+Math.ceil(Math.random()*100000);
      var _div = $('<div>',{
        'class': 'tab-content',
        'id': _id
      });
      this._tabShow.append(_div);
      _div.hide();
      var _a = "<a tab='#"+_id+"'>"+_tabs[i]+"</a>";
      this._tabDiv.append(_a);
    };
    this.bindEvent();
  },

  addDivByTab:function(target_, tab_){
    var _contents = this._tabShow.children('.tab-content');
    var _as = this._tabDiv.children('a');
    for (var i = 0; i < _as.length; i++) {
      if (_as[i].textContent !== tab_) {
        continue;
      };
      var _div = $(_contents[i]);
      _div.append(target_);
    };
  },

  setShowByTab:function(tab_){
    var _contents = this._tabShow.children('.tab-content');
    var _as = this._tabDiv.children('a');
    for (var i = 0; i < _as.length; i++) {
      if (_as[i].textContent !== tab_) {
        $(_contents[i]).hide();
        continue;
      };
      $(_as[i]).addClass("selected");
      $(_contents[i]).show();
    };
  },

  injectParent:function($parent_){
    $parent_.append(this._tabShow);
  },

  bindEvent:function(){
    var _this = this;
    // tabs 
    $(function() {  
      var tabhosts = $(_this._tabDiv.children('a')); 
      tabhosts.each(function() {
        $($(this).attr("tab")).slideUp();
        if ($(this).hasClass("selected")) {
          $($(this).attr("tab")).slideDown();  
        }    
        $(this).mousedown(function(event) {  
          event.preventDefault();    
          event.stopPropagation();
          if (!$(this).hasClass("selected")) {  
            tabhosts.each(function() {  
              $(this).removeClass("selected");  
              $($(this).attr("tab")).slideUp(500);  
            });  
            $(this).addClass("selected");  
            $($(this).attr("tab")).slideDown(500);  
          }  
        });  
      });  
    });  
  }
});
//Tooltip libary 
var Tooltip = Class.extend({
  /**
   * [init Tooltip]
   * @param  {[jquery]} $target_ [used bind Event]
   * @param  {[string]} pos_    [flag postion: include top, bottom, left, right and cursor]
   * @return {[type]}          [tooltip obj]
   */
  init:function($target_, pos_){
    if (typeof $target_ === 'undefined') {
      console.log("argument err!!");
      return ;
    }
    this._title = "";
    this._tooltip = null;
    if (typeof pos_ === 'undefined')
      this._pos = 'cursor'; // pos include "top, bottom, left ,right and cursor";
    else this._pos = pos_;
    this._top = null;
    this._left = null;
    this._target = undefined;
    this.bindTarget($target_);
  },
/**
 * [setPosition set postion]
 * @param {[event]} ev [event]
 */
  calPosition:function(ev){
    var _this = this;
    var _targetWidth = $(ev.target).width();
    var _targetHeight = $(ev.target).height();
    var _width = $('#title-inner').width();
    var _height = $('#title-inner').height();
    //target position
    var _targetLeft = $(ev.target).offset().left;
    var _targetTop = $(ev.target).offset().top;
    switch(_this._pos){
      case "top":
        _this._top = _targetTop - _height - 5;
        _this._left = _targetLeft + (_targetWidth - _width)/2 -5;
        break;
      case "bottom":
        _this._top = _targetTop + _targetHeight -5 ;
        _this._left = _targetLeft + (_targetWidth - _width)/2 - 5;
        break;
      case "left":
        _this._top = _targetTop + (_targetHeight - _height)/2 - 5;
        _this._left = _targetLeft - _width -5 ;
        break;
      case "right":
        _this._top  = _targetTop + (_targetHeight - _height)/2 - 5;
        _this._left = _targetLeft + _targetWidth -5;
        break;
      default:
        _this._top = _targetTop + ev.offsetY + 10;
        _this._left = _targetLeft + ev.offsetX + 10;
        break;
    }
    $(".tooltip").css({"top" :(_this._top)+"px", "left" :(_this._left)+"px"});
  },

  setPosition:function(pos_){
    this._pos = pos_;
  },

  getTitle:function(){
    return this._title;
  },

  mouseOver:function(ev){
    if(ev.target.title !== ''){
      this._title = ev.target.title;
      this._target = ev.target;
      ev.target.title = '';
      this._tooltip = "<div class='tooltip'><div id='title-inner' class='tipsy-inner'>"+this._title+"</div></div>";
      $('body').append(this._tooltip);
      this.calPosition(ev);
      $(".tooltip").show('fast');
    }
  },

  mouseOut:function(){
    if (this._title === '') return ;
    if(typeof this._target !== "undefined"){
      this._target.title = this._title;
      this._title = '';
    }
    $(".tooltip").remove();
    this._target = undefined;
  },

  mouseMove:function(ev){
    this.calPosition(ev);
  }, 
/**
 * [bindTarget bind event to target]
 * @param  {[jquery]} $target_ [target]
 * @return {[null]} 
 */
  bindTarget:function($target_){
    var _this = this;
    $target_.mouseover(function(ev){
      _this.mouseOver(ev);
    }); 
    $target_.mouseout(function(){
      _this.mouseOut();
    }); 
    $target_.mousemove(function(ev){
      _this.mouseMove(ev);
    }); 
  }
});
var Unslider = Class.extend({
  init:function($obj_, options_){
    this._obj = $obj_;
    this._options = {
      speed: false,
      delay: 3000,
      complete: false,
      keys: true,
      dots: false,
      fluid: false
    };
    this._sizes = [],
    this._max = [this._obj.outerWidth(),this._obj.outerHeight()],
    this._current = 0;
    this._interval = false;

    if (options_) {
      for(var key in options_) {
        this._options[key] = options_[key];
      }
    };
    this._ul = this._obj.children('ul');
    this._items = this._ul.children('li');
    this.calculate();

    this.setup();
  },

  calculate: function(){
    var _this = this;
    for (var i = 0; i < _this._items.length; i++) {
      var width = $(_this._items[i]).outerWidth();
      var height = $(_this._items[i]).outerHeight();
      _this._sizes[i] = [width,height];
      if (width > _this._max[0]) {_this._max[0] = width};
      if (height > _this._max[1]) {_this._max[1] = height};
    }
  },

  setup:function(){
    var _this = this;
    this._obj.css({
      overflow: 'hidden',
      width: _this._max[0],
      height: _this._items.first().outerHeight()
    });

    _this._ul.css({
      width: (_this._items.length * 100) + '%',
      position: 'relative'
    });
    _this._items.css({
      width: (100 / _this._items.length)+'%'
    })
    if (this._options.delay !== false) {
      _this.start();
      _this._obj.hover(_this.stop,_this.start);
    };
    _this._options.keys && _this.keys();
    _this._options.dots && _this.dots();

    if (this._options.fluid) {
      var resize = function(){
        _this._obj.css('width',Math.min(Math.round((_this._obj.outerWidth() / _this._obj.parent().outerWidth()) * 100), 100) + '%');
      };
      resize();
      $(window).resize(resize);
    }

    if (window.jQuery.event.swipe) {
      _this._obj.on('swipeleft', _this.prev)
        .on('swiperight',_this.next);
    }
  },

  move:function(index_, cb_){
    var _this = this;
    if (!_this._items.eq(index_).length) {index_ = 0};
    if (index_ < 0) { index_ = (_this._items.length -1 ) };
    var _target = _this._items.eq(index_);
    var _hobj = {height: _target.outerHeight()};
    var speed = cb_ ? 5 :_this._options.speed;

    if (!this._ul.is(':animated')) {
      _this._obj.find('.dot:eq(' + index_ + ')').addClass('active').siblings().removeClass('active');
      _this._obj.animate(_hobj, speed);
      _this._ul.animate({left: '-' + index_ + '00%', height: _target.outerHeight()}, speed, function(data){
        _this._current = index_;
      });
    };
  },

  start:function(){
    var _this = this;
    _this._interval = setInterval(function(){
      _this.move(_this._current +1);
    }, _this._options.delay);
  },

  stop:function(){
    var _this = this;
    _this._interval = clearInterval(_this._interval);
  },

  keys:function(){
    var _this = this ;
    $(document).keydown(function(e){
      var key = e.which;
      switch(key){
        case 39: _this.next();
            break;
        case 37: _this.prev();
            break;
        case 27: _this.stop();
            break; 
      }
    });
  },

  next:function(){
    var _this = this;
    _this.stop();
    _this.move(_this._current +1);
  },
  prev:function(){
    var _this = this;
    _this.stop();
    _this.move(_this._current -1);
  },
  dots:function(){
    var _this = this;
    var html = '<ol class="dots">'
    for (var i = 0; i < _this._items.length; i++) {
       html += '<li class="dot' + (i < 1 ? ' active' : '') + '">' + (i + 1) + '</li>'; 
    };
    html += '</ol>'
    _this._obj.addClass('has-dots')
      .append(html)
      .find('.dot').click(function(){
      	  _this.move($(this).index());
      });
  }
});
//windows lib for create window fastly
//this is relaty font-awesome
var Window = Class.extend({
  init:function(id_, title_ , options_){
    this._options = {
      animate: true,             //动画效果
      contentDiv: true,     //包含放置内容的div
      hide: true,                  //右上角隐藏内容按钮，可点击
      min: false,                  //右上角最小化按钮，可点击
      max: true,                     //右上角最大化按钮，可点击
      close: true,                //右上角关闭按钮，可点击
      fadeSpeed: 100,          //打开窗口速度
      hideWindow: false,  //是否直接显示窗口
      width: 600,                   //宽
      height: 600,                //高
      left: 0,                         //位置x坐标
      top: 0,                           //位置y坐标
      contentDiv: true,    //是否新建div窗口
      iframe:false,            //是否使用ifram作为内容框口
      maxWindow: false,  //是否初始最大化
      resize: false,           //设置是否可重新调整窗口的大小
      minWidth: 200,            //设置窗口的最小宽度
      minHeight:200            //设置窗口的最小高度
    };

    //set options
    if (options_) {
      for(var key in options_) {
        this._options[key] = options_[key];
      }
    };

    this._isMouseOnTitleDown = false;       //is mouse down on title
    this._isMouseResizeDown = false;         //is mouse down on resize div
    this._ishideDiv = false;                           //is content div hide
    this._offsetX = 0;                                         //record mouse offset x relate window
    this._offsetY = 0;                                         //record mouse offset y relate window
    this._title = title_;                                   //record title
    this._id = id_;                                                // record id
    this._isMax = false;                                    // record window is maxsize or not

    this._window = $('<div>',{
      'id': this._id,
      'class': 'window'
    });

    this._titleDiv = $('<div>',{
      'class': 'window-top'
    });
    this._window.append(this._titleDiv);

    this._titleText= '<div class="window-title">'+this._title+'</div>';
    this._titleDiv.append(this._titleText);
    this._titleText = $(this._titleDiv.children('.window-title')[0]);

    this._titleButton = $('<div>',{
      'class': 'window-title-button'
    }) ;
    this._titleDiv.append(this._titleButton);

    if (this._options.contentDiv) {
      this._windowContent = $('<div>',{
        'class':'window-content'
      });
      this._window.append(this._windowContent);
    } else if (this._options.iframe) {
      this._windowContent = $('<iframe>',{
        'class':'window-content',
      })
      this._window.append(this._windowContent);
    };

    if (this._options.resize == true) {
      this._dragDiv = $('<div>', {
        'class': 'rb-drag-div'
      });
      this._window.append(this._dragDiv);
    }

    $('body').
    append(this._window);
    
    this.setOptions();
    if (this._options.hideWindow === false){
      this.show();
    }else {
      this.hide();
    }
    if(this._options.maxWindow){
      this.maxWindow(this);
    }
    this.bindEvent();
  },

  /**
   * [setOptions set options by this._options]
   */
  setOptions:function(){
    var _this = this;
    for(var key in _this._options) {
      switch(key){
        case 'close':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-close' class='window-button-close' href='#'><i class='icon-remove'></i></a>");
            _this.bindButton($(_this._titleButton.children('.window-button-close')[0]),_this.closeWindow, _this);
            $('.window-button-'+key).addClass('active');
          }
          break;
        case 'max':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-max' class='window-button-max' href='#'><i class='icon-resize-full'></i></a>");
            _this.bindButton($(_this._titleButton.children('.window-button-max')[0]),_this.maxWindow, _this);
            $('.window-button-'+key).addClass('active');
          }
          break;
        case 'min':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-min' class='window-button-min' href='#'><i class='icon-minus'></i></a>");
            $('.window-button-'+key).addClass('active');
          }
          break;
        case 'hide':
          if (_this._options[key] == true) {
            _this._titleButton.append("<a id='window-"+_this._id+"-hide' class='window-button-hide' href='#'><i class='icon-double-angle-up'></i></a>");
            _this.bindButton($(_this._titleButton.children('.window-button-hide')[0]),_this.hideDiv, _this);
            $('.window-button-'+key).addClass('active');
          }
          break;
      }
    }
    this.setWindowPos(this._options);
    this.resizeWindow(this._options);
  },

  /**
   * [setTitleButton bind eventAction_ to $target_, with argument window obj(this)]
   * @param {[jquery]} $target_     [target for bind obj]
   * @param {[event]} eventAction_ [event when click the target]
   * @param {[this]} windowObj_   [this ]
   */
  bindButton:function($target_, eventAction_, windowObj_){
    $target_.mousedown(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }).mouseup(function(ev){
      eventAction_(windowObj_);
      ev.stopPropagation();
    })
    .click(function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
    });
  },

  /**
   * [changeIcon change icon by class]
   * @param  {[string]} aClass_    [class name of a]
   * @param  {[string]} oldIcon_   [old icon index class]
   * @param  {[string]} newIcon_   [new icon index class]
   * @param  {[string]} newAction_ [event when click this a]
   * @return {[null]}            [description]
   */
  changeIcon:function(aClass_, oldIcon_, newIcon_, newAction_){
    var _a = $(this._titleButton.children('.'+aClass_)[0]);
    var _icon = $(_a.children('.'+oldIcon_)[0]);
    _icon.removeClass(oldIcon_);
    _icon.addClass(newIcon_);
    _a.unbind();
    this.bindButton(_a, newAction_, this);
  },

  /**
   * [bindEvent bind dragWindow Event and resizeWindow Event]
   * @return {[type]} [description]
   */
  bindEvent:function(){
    var _this = this;

    //forbid context menu
    $(document).on('contextmenu','#'+_this._window[0].id, function(ev){
      ev.stopPropagation();
      ev.preventDefault();
    });

    //drag window
    this._titleDiv.mousedown(function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      if (_this._isMax) {
        return ;
      };
      _this._isMouseOnTitleDown = true;
      _this._offsetX = ev.clientX - _this._window.position().left;
      _this._offsetY = ev.clientY - _this._window.position().top;
      _this._window.fadeTo(20, 0.5);
    }).mouseup(function(ev){
      ev.stopPropagation();
      _this._isMouseOnTitleDown = false;
      _this._window.fadeTo(20, 1);
    });

    //resize window
    if (typeof this._dragDiv !== 'undefined') {
      this._dragDiv.mousedown(function(ev){
        ev.stopPropagation();
        if (_this._isMax || _this._ishideDiv || !_this._options.resize) {
          return ;
        };
        _this._isMouseResizeDown = true;
        _this._window.fadeTo(20, 0.9);
      }).mouseup(function(ev){
        ev.stopPropagation();
        if (!_this._isMouseResizeDown) {
          return ;
        }
        _this._isMouseResizeDown = false;
        _this._options.width = _this._window.width();
        _this._options.height = _this._window.height();
        _this._window.fadeTo(20, 1);
      });
    }
    $(document).mousemove(function(ev){
      if(_this._isMouseOnTitleDown){ 
        var x = ev.clientX - _this._offsetX; 
        var y = ev.clientY - _this._offsetY; 
        _this.setWindowPos({left:x, top: y});
        _this._options.top = y;
        _this._options.left = x;
        _this._titleDiv.css('cursor','move');
      }else if (_this._isMouseResizeDown && _this._options.resize) {
        var _width = ev.clientX - _this._window.position().left + 5;
        var _height = ev.clientY - _this._window.position().top + 5;
        if (_width < _this._options.minWidth){
          _width = _this._options.minWidth;
        } 
        if (_height < _this._options.minHeight) {
          _height = _this._options.minHeight;
        }
        _this._options.width = _width;
        _this._options.height = _height;
        _this.resizeWindow(_this._options);
        _this._dragDiv.css('cursor', 'se-resie');
      };
    });
  },
  /**
   * [resizeWindow  resize Window without animate]
   * @param  {[type]} size_ [new size]
   * @return {[type]}       [description]
   */
  resizeWindow:function(size_){
    var _this = this;
    var _tmp = size_.width-2;
    _this._titleDiv.css({'width': _tmp+'px'});
    _tmp = size_.width-130;
    _this._titleText.css({'width': _tmp+'px'});
    _tmp = size_.width -10;
    var _tmp1 = size_.height - 50;
    if(typeof _this._windowContent !== 'undefined')
      _this._windowContent.css({'width':_tmp+'px', 'height': _tmp1+'px'});
  },
  /**
   * [resizeWindowWithAnimate resize window with animate]
   * @param  {[type]} size_ [new size ]
   * @param  {[type]} pos_  [new position]
   * @return {[type]}       [description]
   */
  resizeWindowWithAnimate:function(size_, pos_){
    var _this = this;
    _this._window.animate({left: pos_.left + 'px', top: pos_.top + 'px'},_this._options.fadeSpeed);
    var _tmp = size_.width-2;
    _this._titleDiv.animate({width: _tmp+'px'},_this._options.fadeSpeed);
    _tmp = size_.width-130;
    _this._titleText.animate({width: _tmp+'px'}, _this._options.fadeSpeed);
    _tmp = size_.width -10;
    var _tmp1 = size_.height - 50;
    if(typeof _this._windowContent !== 'undefined'){
      _this._windowContent.animate({width:_tmp+'px', height: _tmp1+'px'},_this._options.fadeSpeed);
    } 
  },
  /**
   * [maxWindow max window]
   * @param  {[this]} windowObj_ [this obj]
   * @return {[type]}            [description]
   */
  maxWindow:function(windowObj_){
    var _this = windowObj_;
    var _winWidth = document.body.clientWidth;
    var _winHeight = document.body.clientHeight;
    var _dockBottom = $('#dock').attr('bottom');
    var _pos = {
      left: 0,
      top: 0
    };
    var _size = {
      width: _winWidth,
      height: _winHeight
    };
    if(_this._options.animate){
      _this.resizeWindowWithAnimate(_size, _pos);
    } else {
      _this.setWindowPos(_pos);
      _this.resizeWindow(_size);
    } 

    _this._isMax = true;
    _this._isMouseResizeDown = false;
    _this._window.fadeTo(20,1);
    _this.changeIcon('window-button-max', 'icon-resize-full', 'icon-resize-small', _this.recoverWindow);
  },
  /**
   * [recoverWindow recover window positon and size before max window]
   * @param  {[this]} windowObj_ [this obj]
   * @return {[type]}            [description]
   */
  recoverWindow:function(windowObj_){
    var _this = windowObj_;
    var _pos = {
      left: _this._options.left,
      top: _this._options.top
    };
    var _size= {
      width: _this._options.width,
      height:_this._options.height
    }
    if(_this._options.animate){
      _this.resizeWindowWithAnimate(_size, _pos);
    } else {
      _this.setWindowPos(_pos);
      _this.resizeWindow(_size);
    } 
    _this._isMax = false;
    _this.changeIcon('window-button-max', 'icon-resize-small', 'icon-resize-full', _this.maxWindow);
  },

  /**
   * [closeWindow close window]
   * @param  {[this ]} windowObj_ [this obj]
   * @return {[type]}            [description]
   */
  closeWindow:function(windowObj_){
    var _this = windowObj_;
    if (_this._options.animate) {
      _this._window.fadeOut(_this._options.fadeSpeed,function(){
        _this._window.remove();
      });
    } else {
      _this._window.remove();
    }
  },

  /**
   * [hideDiv hide content div ]
   * @param  {[this]} windowObj_ [this]
   * @return {[type]}            [description]
   */
  hideDiv:function(windowObj_){
    var _this = windowObj_;
    if (typeof _this._windowContent !== 'undefined') {
      if (_this._options.animate) {
        _this._windowContent.slideUp(_this._options.fadeSpeed);
      } else {
        _this._windowContent.hide();
      }
    }
    console.log('hide window');
    _this._ishideDiv = true;
    _this._isMouseResizeDown = false;
    _this.changeIcon('window-button-hide'
      , 'icon-double-angle-up'
      , 'icon-double-angle-down'
      ,  _this.showDiv
    );
  },
  /**
   * [showDiv show content div]
   * @param  {[this]} windowObj_ [this]
   * @return {[type]}            [description]
   */
  showDiv:function(windowObj_){
    var _this = windowObj_;
    _this._ishide = false;
    if (typeof _this._windowContent !== 'undefined') {
      if (_this._options.animate) {
        _this._windowContent.slideDown(_this._options.fadeSpeed);
      } else {
        _this._windowContent.show();
      }
    }
    _this._ishideDiv = false;
    _this.changeIcon('window-button-hide'
      , 'icon-double-angle-down'
      , 'icon-double-angle-up'
      ,  _this.hideDiv
    );
  },
  /**
   * [setWindowPos set position of window]
   * @param {[type]} pos_ [description]
   */
  setWindowPos:function(pos_){
    this._window.css('left', pos_['left'] + 'px');
    this._window.css('top', pos_['top'] + 'px');
    if (typeof this._dragDiv !== 'undefined') {
      this._dragDiv.css('left',pos_['left']+this._options._winWidth -10 + 'px');
      this._dragDiv.css('top', pos_['pos']+this._options._winHeight-10 + 'px');
    }
  },
  /**
   * [show show Window]
   * @return {[type]} [description]
   */
  show:function(){
    if (this._options.animate) {
      this._window.fadeIn(this._options.fadeSpeed);
    } else {
      this._window.show();
    }
  },
  /**
   * [append appent content]
   * @param  {[type]} content_ [append content]
   * @return {[type]}          [description]
   */
  append:function(content_){
    if (content_) {
      this._windowContent.append(content_);
    }
  },
  /**
   * [close close window]
   * @return {[type]} [description]
   */
  close:function(){
    var _this = this ;
    if (typeof this._window !== 'undefined'){
      this.closeWindow(_this);
    } 
  },
  /**
   * [hide hide window]
   * @return {[type]} [description]
   */
  hide:function(){
    if (this._options.animate) {
      this._window.fadeOut(this._options.fadeSpeed);
    } else {
      this._window.hide();
    }
  },
  /**
   * [appendHtml append html]
   * @param  {[type]} src_ [description]
   * @return {[type]}      [description]
   */
  appendHtml:function(src_){
    if(this._options.iframe){
      this._windowContent[0].src = src_;
    }
  }

});
