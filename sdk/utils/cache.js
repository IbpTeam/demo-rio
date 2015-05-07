// Elements of this cache are objects like: {
//  val: the real value
//  age: the age of this value
// }, by default.
function Cache(capacity, stratagy) {
  this._capacity = capacity || 10;
  this._size = 0;
  this._c = new Array(capacity);
  this._init = this._born;
  this._update = this._older;
  this._repTarget = this._findOldest;
  if(typeof stratagy !== 'undefined') {
    if(typeof stratagy.init !== 'undefined' 
        && typeof stratagy.update !== 'undefined'
        && typeof stratagy.repTarget !== 'undefined') {
      this._init = stratagy.init;
      this._update = stratagy.update;
      this._repTarget = stratagy.repTarget;
    }
  }
}

Cache.prototype.get = function(key) {
  if(typeof this._c[key] !== 'undefined') {
    // update the information of cached element
    this._update(key, this._c);
    return this._c[key].val;
  }
  throw 'Not found';
}

Cache.prototype.set = function(key, val) {
  // By default, remove the LRU obj if cache has full
  if(this._size == this._capacity) {
    this._repTarget(this._c);
    this._size--;
  }
  this._c[key] = {
    val: val
  };
  this._init(key, this._c);
  this._size++;
}

Cache.prototype._born = function(key, list) {
  list[key].age = 1;
}

Cache.prototype._older = function(key, list) {
  list[key].age = 0;
  for(var k in list) {
    list[k].age++;
  }
}

Cache.prototype._findOldest = function(list) {
  var oldest = 0, oKey = null;
  for(var k in list) {
    if(list[k].age > oldest) {
      oldest = list[k].age;
      oKey = k;
    }
  }
  // release the corresponding resource
  try {
    list[key].val.release();
    list[key] = null;
    delete list[key];
  } catch(e) {
    console.log(e);
  }
}

exports.Cache = Cache;
