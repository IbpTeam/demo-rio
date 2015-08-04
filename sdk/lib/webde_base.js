//This file includes base classes and all abstract interfaces used in this project
//

//Base Class for every class in this project
//
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

//Event base Class
var Event = Class.extend({
  init: function() {
    this._handlers = [];
  },

  on: function(event_, handler_) {
    if(typeof this._handlers[event_] === 'undefined') {
      this._handlers[event_] = [];
    }
    this._handlers[event_].push(handler_);
    return this;
  },

  off: function(event_, handler_) {
    if(arguments.length == 0) {
      for(var key in this._handlers) {
        this._handlers[key] = null;
        delete this._handlers[key];
      }
      return this;
    }
    if(arguments.length == 1 && typeof this._handlers[event_] !== 'undefined') {
      this._handlers[event_] = null;
      delete this._handlers[event_];
      return this;
    }
    for(var idx = 0; idx < this._handlers[event_].length; ++idx) {
      if(handler_ == this._handlers[event_][idx]) {
        this._handlers[event_].splice(idx, 1);
        break;
      }
    }
    return this;
  },

  emit: function(event_) {
    if(typeof this._handlers[event_] === 'undefined') return ;
    var args = [];
    for(var i = 1; i < arguments.length; ++i)
      args.push(arguments[i]);
    for(var i = 0; i < this._handlers[event_].length; ++i) {
      this._handlers[event_][i].apply(this, args);
    }
    return this;
  }
});

var TrNode = Class.extend({
  init: function(id_, val_, parent_) {
    this._val = val_;
    this._parent = parent_;
    this._c = [];
    this._size = 0;
    this._id = id_;
  },

  ID: function() {
    return this._id;
  },

  add: function(node_) {
    if(typeof node_ === 'undefined' || node_ == null) return 'Illegal node!!';
    if(typeof this._c[node_.ID()] !== "undefined") {
      return 'This component[id: ' + node_.ID() + '] has already existed!!';
    }
    this._c[node_.ID()] = node_;
    ++this._size;
    return null;
  },

  remove: function(node_) {
    if(typeof node_ === 'undefined' || node_ == null) return 'Illegal node!!';
    if(typeof this._c[node_.ID()] === 'undefined') {
      return 'This component[id: ' + node_.ID() + '] is not existed!!';
    }
    this._c[node_.ID()] = null;
    delete this._c[node_.ID()];
    --this._size;
    return null;
  },

  getParent: function() {
    return this._parent;
  },

  getChildren: function() {
    return this._c;
  },

  getChild: function(id_) {
    return this._c[id_];
  },

  hasChild: function(cID_) {
    return ((typeof this._c[cID_] === 'undefined') ? false : true);
  },

  size: function() {return this._size;}
});

//The base Class for Model classes
//
var Model = Event.extend({
  init: function(id_, parent_) {
    this.callSuper();
    this._id = id_;
    var p = parent_ || {_node: null};
    this._node = TrNode.create(id_, this, p._node); // model container
    // this._obList = [];
  },

  release: function() {},

  getID: function() {return this._id;},

  getParent: function() {
    var ret = this._node.getParent();
    if(ret != null) return ret._val;
    return null;
  },

  add: function(component_) {
    if(typeof component_ === 'undefined' || component_ == null) return false;
    var ret = this._node.add(component_._node);
    if(ret == null) {
      this.emit('add', null, component_);
      return true;
    }
    this.emit('add', ret);
    return false;
  },

  remove: function(component_) {
    if(typeof component_ === 'undefined' || component_ == null) return false;
    var ret = this._node.remove(component_._node);
    if(ret == null) {
      this.emit('remove', null, component_);
      return true;
    }
    this.emit('remove', ret);
    return false;
  },

  getCOMById: function(id_) {
    var ret = this._node.getChild(id_);
    if(ret) return ret._val;
    return null;
  },

  getCOMByAttr: function(attr_, value_) {
    var nodes = this._node.getChildren();
    for(var key1 in nodes) {
      for(var key2 in nodes) {
        if(key2 == attr_ && nodes[key1][key2] == value_)
          return nodes[key1];
      }
    }
    return null;
  },

  getAllCOMs: function() {
    return this._node.getChildren();
  },

  has: function(cID_) {
    return this._node.hasChild(cID_); 
  },

  size: function() {return this._node.size();}
});

//The base Class for Observer classes
//
var Observer = Class.extend({
  init: function(id_) {
    this._id = id_;
  },

  getID: function() {return this._id;},

  registObservers: function() {}
});

//The base Class for View classes
//One kind of Observer
//
var View = Observer.extend({
  init: function(id_, model_, parent_) {
    this.callSuper(id_);
    this._model = model_;
    this._parent = parent_;
    this.$view = null;
    this._controller = null; // created by subclasses
  },

  destroy: function() {
    this.hide();
    for(var key in this.__handlers) {
      this._model.off(key, this.__handlers[key]);
    }
  },

  getModel: function() {
    return this._model;
  },

  getParent: function() {
    return this._parent;
  },

  getView: function() {
    return this.$view;
  },

  getCtrlor: function() {
    return this._controller;
  },

  show: function() {},

  hide: function() {}
});

//The base Class for Controller classes
//One kind of Observer
//
var Controller = Observer.extend({
  init: function(view_) {
    this.callSuper(view_.getID() + '-controller');
    this._model = view_._model;
    this._view = view_;
  },

  destroy: function() {
  }
});

// A remote observer based on web socket
//
var RemoteObserver = Model.extend({
  // param:
  //  local: run in nw or not
  //  callback: call back function
  //
  init: function(local, callback) {
    this.callSuper('ws');
    var addr = '',
        cb = callback || function() {};
    this._local = local;
    addr = (this._local ? 'ws://127.0.0.1:8888/ws' : ('ws://' + location.host + '/ws'));
    try {
      this._ws = new WebSocket(addr);
      this._ws.onopen = function() {
        console.log('WebSocket established successfully.');
        cb(null);
      };
      this._ws.onclose = function() {
        console.log('The WebSocket connection has been closed.');
      };
      var _this = this;
      this._ws.onmessage = function(ev) {
        console.log(ev.data);
        try {
          _this.__dispacher(JSON.parse(ev.data));
        } catch(e) {
          return console.log(e);
        }
      };
      this._ws.onerror = function(e) {
        console.log('Error: ', e);
        cb(e);
      };
    } catch(e) {
      console.log(e);
    }
  },

  getConnection: function() {return this._ws;},

  // msg is a JSON object
  send: function(msg) {
    try {
      this._ws.send(JSON.stringify(msg));
    } catch(e) {
      console.log('Send WebSocket Message Error:', e);
    }
    return this;
  },

  __dispacher: function(msg) {
    if(typeof msg.sessionID !== 'undefined') {
      this._sessionID = msg.sessionID;
      return ;
    }
    if(msg.Status == 'error') return console.log(msg.Data);
    this.emit(msg.Event, msg.Data);
  },

  getSessionID: function() {return this._sessionID;},

  isLocal: function() {return this._local;},

  close: function() {
    try {
      this._ws.close();
    } catch(e) {
      console.log(e);
    }
    return this;
  }
});

