var fs = require('fs'),
    events = require('events'),
    util = require('util');

// Event:
//  'lines': emitted when some lines are OK to read
//    callback: function(lines)
//      @param lines: array of some lines of file
//  'end': emitted when file read completed
//    callback: function()
//  'error': emitted when error occured
//    callback: function(err)
//      @param err: error description
function LineReader(file_, separator_) {
  this._separator = separator_ || /\r?\n|\r/;
  this._rStream = fs.createReadStream(file_, {encoding: 'utf8'});
  this._remain = '';
  events.EventEmitter.call(this);

  var _this = this;
  this._rStream.on('open', function() {
  }).on('data', function(data_) {
    _this.parseData(data_);
  }).on('error', function(err_) {
    _this.emit('error', err_);
  }).on('end', function() {
    if(_this._remain != '')
      _this.emit('lines', [_this._remain]);
    _this.emit('end');
  });
}
util.inherits(LineReader, events.EventEmitter);

LineReader.prototype.parseData = function(data_) {
  var lines = data_.split(this._separator);
  lines[0] = this._remain + lines[0];
  this._remain = lines.pop();
  this.emit('lines', lines);
}
exports.LineReader = LineReader;
  
function readJSONFile(path_, callback_) {
  var cb_ = callback_ || function() {},
      lr = new LineReader(path_),
      content = [];
  lr.on('lines', function(lines_) {
    for(var i in lines_) {
      if(lines_[i].match(/^\s*#/) == null) content.push(lines_[i]);
    }
  }).on('end', function(){
    try {
      json = JSON.parse(content.join(''));
      return cb_(null, json);
    } catch(e) {
      return cb_(e);
    }
  }).on('error', function(err_) {
    cb_('Fail to load file: ' + err_);
  });
}
exports.readJSONFile = readJSONFile;

function writeJSONFile(path_, json_, callback_) {
  var cb_ = callback_ || function() {};
  try {
    fs.writeFile(path_, JSON.stringify(json_, null, 2), function(err_) {
      if(err_) return cb_(err_);
      cb_(null);
    });
  } catch(e) {
    return cb_(e);
  }
}
exports.writeJSONFile = writeJSONFile;
