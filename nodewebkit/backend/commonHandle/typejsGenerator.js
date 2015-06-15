var fs = require('fs');
var pathModule = require('path');
var Q = require('q');
var config = require('../config.js');

//const
var DATAJSDIR = config.DATAJSDIR;

function generator(type_name, func_content) {
  var _type_name = type_name;
  var _js_file_path = pathModule.join(DATAJSDIR, _type_name + ".js");
  var _func_content = func_content;
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
  + "var fs_extra = require('fs-extra');\n"
  + "var config = require('../config');\n"
  + "\n"
  +"//@const"
  + "var CATEGORY_NAME = " + _type_name + ";\n"
  + "\n"
  + "function getOpenInfo(item) {\n"
  + "  if (item == null) {\n"
  + "    console.log('read data : ' + item);\n"
  + "    return undefined;\n"
  + "  }\n"
  + "  console.log('read data : ' + item.path);\n"
  + "  var source;\n"
  + "  if (item.postfix == null) {\n"
  + "    source = {\n"
  + "      openmethod: 'alert',\n"
  + "      content: item.path + ' self defined type.'\n"
  + "    };\n"
  + "  } else {\n"
  + "    var _exec = require('child_process');\n"
  + "    _exec.exec(s_command, function() {});\n"
  + "    if (supportedKeySent === true) {\n"
  + "      source.windowname = s_windowname;\n"
  + "    }\n"
  + "    break;\n"
  + "  }\n"
  + "}\n"
  + "return source;\n"
  + "}\n"
  + "exports.getOpenInfo = getOpenInfo;\n"
  + "\n"
  +_func_content.toString() + "\n"

  return Q.nfcall(fs.writeFile, _js_file_path, prototype);
}
exports.generator = generator;