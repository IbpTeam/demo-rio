var fs = require('fs');
var pathModule = require('path');
var Q = require('q');
var config = require('systemconfig');
var promised = require('./promisedFunc');

//const
var DATAJSDIR = config.DATAJSDIR;
var FORMATLIST = {"music":"audio","document":"txt"}

function generator(type_name, func_content) {
  var _type_name = type_name;
  var _js_file_path = pathModule.join(DATAJSDIR, _type_name + ".js");
  var _func_content = func_content;
  var _format = FORMATLIST[_type_name] || _type_name;
  var prototype =
    "/**\n"
  + " * @Copyright:\n"
  + " *\n"
  + " * @Description: " + _type_name + " type's methods.\n"
  + " *\n"
  + " * @author: Xiquan \n"
  + " *\n"
  + " * @Data:" + (new Date()).toString() + "\n"
  + " *\n"
  + " * @version:0.1.0\n"
  + " **/\n"
  + "var pathModule = require('path');\n"
  + "var fs = require('fs');\n"
  + "\n"
  +"//@const\n"
  + 'var CATEGORY_NAME = "' + _type_name + '";\n'
  + "var _html_open = {mp4:true,MP4:true,mp3:true,MP3:true,ogg:true,OGG:true,ogv:true,OGV:true,txt:true,TXT:true}\n"
  + "var supportedKeySent = false;\n"
  + "\n"
  + "function getOpenInfo(item) {\n"
  + "  if (item == null) {\n"
  + "    console.log('read data : ' + item);\n"
  + "    return undefined;\n"
  + "  }\n"
  + "  console.log('read data : ' + item.path);\n"
  + "  var source = {\n"
  + "      openmethod: 'html',\n"
  + "      format: '" + _format + "',\n"
  + "      title: '文件浏览',\n"
  + "      content: item.path\n"
  + "   };\n"
  + "  if (item.postfix == \"txt\") {\n"
  + "    source.format =  'txtfile';\n"
  + "  }else if(item.postfix == \"ppt\" || item.postfix == \"pptx\"){\n"
  + "    supportedKeySent = true;\n"
  + "   } \n"
  + "  if (item.postfix == null) {\n"
  + "    source.openmethod =  'alert',\n"
  + "    source.content = item.path + ' self defined type.'\n"
  + "  }else if(_html_open[item.postfix]){\n"
  + "    if (supportedKeySent === true) {\n"
  + "      source.windowname = s_windowname;\n"
  + "    }\n"
  + "  } else {\n"
  + "    var _exec = require('child_process');\n"
  + "    var s_command= \"xdg-open \\\"\" + item.path + \"\\\"\";\n"
  + "    var supportedKeySent = false;\n"
  + "    _exec.exec(s_command, function() {});\n"
  + "    if (supportedKeySent === true) {\n"
  + "      source.windowname = s_windowname;\n"
  + "    }\n"
  + "  }\n"
  + "  return source;\n"
  + "}\n"
  + "exports.getOpenInfo = getOpenInfo;\n"
  + "\n"
  +_func_content.toString() + "\n"
  + "exports.getPropertyInfo = getPropertyInfo;\n"

  return promised.write_file(_js_file_path, prototype);
}
exports.generator = generator;


function generateDefaultTypeFiles() {
  var _music = require('../data/music');
  var _document = require('../data/document');
  var _video = require('../data/video');
  var _picture = require('../data/picture');
  var _other = require('../data/other');
  return generator("music", _music.getPropertyInfo)
    .then(function() {
      return generator("document", _document.getPropertyInfo)
    })
    .then(function() {
      return generator("video", _video.getPropertyInfo)
    })
    .then(function() {
      return generator("picture", _picture.getPropertyInfo)
    })
    .then(function() {
      return generator("other", _other.getPropertyInfo)
    })
}
exports.generateDefaultTypeFiles = generateDefaultTypeFiles;
