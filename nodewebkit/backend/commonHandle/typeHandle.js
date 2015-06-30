var fs = require('fs');
var fs_extra = require('fs-extra');
var pathModule = require('path');
var config = require('systemconfig');
var rdfHandle = require('./rdfHandle');
var typejsGenerator = require('./typejsGenerator');
var promised = require('./promisedFunc')
var path = require("path");
var Q = require('q');

//const
var TYPEFILEDIR = config.TYPEFILEDIR;
var TYPECONFPATH = config.TYPECONFPATH;
var DATAJSDIR = config.DATAJSDIR;


/**
 * @method dbInitial
 *   Initalize the levelgraph database. This step would put the RDF Schema of type defin-
 *   ition triples into database, including base properties.
 *
 */
function initTypeDef() {
  var allTriples = [];
  return refreshConfFile()
    .then(function() {
      return typejsGenerator.generateDefaultTypeFiles();
    })
    .then(function() {
      return getDefinedTypeProperty()
        .then(function(info_) {
          return rdfHandle.defTripleGenerator(info_);
        })
        .then(function(triples_) {
          var _db = rdfHandle.dbOpen();
          return rdfHandle.dbPut(_db, triples_)
            .then(function() {
              return triples_;
            })
        })
    })
}
exports.initTypeDef = initTypeDef;


function getDefinedTypeProperty() {

  function resolveProperty(fileList) {
    var _property = {};
    var _postfix = {};
    var _category = {};
    for (var i = 0, l = fileList.length; i < l; i++) {
      var _name = pathModule.basename(fileList[i], '.type');
      var _file_path = pathModule.join(TYPEFILEDIR, fileList[i]);
      var _raw_content = fs.readFileSync(_file_path, 'utf8');
      var _content = JSON.parse(_raw_content);
      //info for type define triples
      _property[_name] = _content.property;
      _property[_name]["subject"] = "http://example.org/category#" + _name;
    }
    return _property;
  }
  return promised.read_dir(TYPEFILEDIR)
    .then(function(file_list_) {
      return refreshConfFile()
        .then(function() {
          return resolveProperty(file_list_);
        });
    });
}
exports.getDefinedTypeProperty = getDefinedTypeProperty;


/**
 * @method getProperty
 *   get property info object of obne kind of category
 *
 * @param1 category
 *   @string
 *      a type category name
 *
 */
function getProperty(category) {
  return readFile(TYPECONFPATH)
    .then(function(_type_conf) {
      if (_type_conf["property"][category]) {
        return readFile(_type_conf["property"][category])
          .then(function(result) {
            return result["property"];
          })
      } else {
        throw new Error("TYPE NOT REGISTERED");
      }
    });
}
exports.getProperty = getProperty;

function test_getProperty(cb) {
  var combination_ = [
    getProperty("base"),
    getProperty("document"),
    getProperty("picture"),
    getProperty("contact"),
    getProperty("video"),
    getProperty("music")
  ];
  Q.allSettled(combination_)
    .then(function(result) {
      cb(null, result);
    })
    .fail(function(err) {
      cb(err);
    })
    .done();
}
exports.test_getProperty = test_getProperty;


/**
 * @method getPostfixList
 *   get regestered postfix list from typeDefeine.conf
 *
 */
function getPostfixList() {
  return readFile(TYPECONFPATH)
    .then(function(_type_conf) {
      if (_type_conf["postfix"]) {
        return _type_conf["postfix"];
      } else {
        throw new Error("POSTFIX NOT REGISTERED");
      }
    });
}
exports.getPostfixList = getPostfixList;


/**
 * @method getTypeNameByPostfix
 *   get type/category name by postfix
 *   return type/category name in string
 *
 * @param1 postfix
 *   @string
 *      postfix, as "mp4" or "doc"
 *
 */
function getTypeNameByPostfix(postfix) {
  if (postfix[0] === ".") {
    postfix = postfix.substr(1);
  }
  return getPostfixList()
    .then(function(postfix_list_) {
      if (postfix_list_[postfix]) {
        return postfix_list_[postfix];
      } else {
        return "other";
      }
    });
}
exports.getTypeNameByPostfix = getTypeNameByPostfix;

function test_getTypeNameByPostfix(cb) {
  var combination_ = [
    getTypeNameByPostfix("mp4"),
    getTypeNameByPostfix("ogg"),
    getTypeNameByPostfix("doc"),
    getTypeNameByPostfix("xxx"),
    getTypeNameByPostfix("mp3"),
    getTypeNameByPostfix("jpg")
  ];
  Q.allSettled(combination_)
    .then(function(result) {
      cb(null, result);
    })
    .fail(function(err) {
      cb(err);
    })
    .done();
}
exports.test_getTypeNameByPostfix = test_getTypeNameByPostfix;


/**
 * @method readFile
 *   read the content of typeDefine.conf
 *   return the result of object
 *
 * @param1 path
 *   @string
 *      a full path string of file
 *
 */
function readFile(path) {
  return promised.read_file(path)
    .then(function(content_) {
      return JSON.parse(content_);
    });
}

/**
 * @method readConfFile
 *   rewrite the typeDefine.conf based on current *.type file
 *
 */
function refreshConfFile() {
  var _combination = [];
  var _property = {};
  return promised.read_dir(TYPEFILEDIR)
    .then(function(file_list_) {
      for (var i = 0, l = file_list_.length; i < l; i++) {
        var _file_path = pathModule.join(TYPEFILEDIR, file_list_[i]);
        var _name = pathModule.basename(file_list_[i], '.type');
        _property[_name] = _file_path;
        _combination.push(readFile(_file_path));
      }
      return Q.all(_combination)
        .then(function(result) {
          var _postfix = {}
          for (var j = 0, m = result.length; j < m; j++) {
            for (var item_ in result[j]["postfix"]) {
              _postfix[item_] = result[j]["postfix"][item_];
            }
          }
          var _type_info = {
            property: _property,
            postfix: _postfix
          }
          return promised.write_file(TYPECONFPATH, JSON.stringify(_type_info, null, 2));
        });
    });
}
exports.refreshConfFile = refreshConfFile;


/**
 * @method getTypeMethod
 *   return all *.js object
 *
 */
function getTypeMethod(typeName) {
  return readFile(TYPECONFPATH)
    .then(function(conf_) {
      var all_type_object_ = {};
      var _types = conf_["property"];
      delete _types.base;
      delete _types.contact;
      if (_types[typeName]) {
        var _path = pathModule.join(DATAJSDIR, typeName + ".js");
        var type_object_ = require(_path);
        return type_object_;
      } else {
        var _err = new Error("TYPE NOT REGISTERED...");
        throw _err;
      }
    })
}
exports.getTypeMethod = getTypeMethod;


/**
 * @method getTypeMethod
 *   generate all *.js file
 *
 * @param info
 *  object,format as below:
 *   {
 *         type_name:"document",         //value is a string piece
 *         func_content:function(){}  //value should be a function object
 *     }
 *
 */
function methodGenerator(info) {
  var _type_name = info.type_name;
  var _func_content = info.func_content || "";
  return typejsGenerator.generator(_type_name, _func_content);
}
exports.methodGenerator = methodGenerator;


/**
 * @method typeFileGenerator
 *   generate typeFile and output to typeDefine folder
 *
 * @param typeName
 * Name of Type
 *
 * @propertyArr
 * String Array , property of data, 1..n
 *
 * @profixArr
 * String Array , profix of the type, 1..n
 *
 *
 */
function typeFileGenerator(typeName, propertyArr, profixArr) {
  var _type_name = typeName.toString();
  if (propertyArr.length == 0 || propertyArr === null)
    throw new Error("[typeFileGenerator]No Property!");
  if (profixArr.length == 0 || profixArr === null)
    throw new Error("[typeFileGenerator]No profix!");
  var tab = "  ";
  var newLine = "\n";
  var tmpArr = new Array();
  propertyArr = proertyModify(propertyArr);
  profixArr = profixModify(profixArr);
  var propertyHead = tab + "\"property\": {" + newLine;
  var propertyTail = tab + "}";
  var propertyOutputString = stringmaker(propertyHead, propertyArr, propertyTail);
  var profixHead = tab + "\"postfix\": {" + newLine;
  var profixTail = tab + "}";
  var profixOutputString = stringmaker(profixHead, profixArr, profixTail);
  var outputString = "{" + newLine + propertyOutputString + "," + newLine + profixOutputString + newLine + "}";
  var _file_name = path.join(TYPEFILEDIR, typeName + ".type");

  function proertyModify(arr) {
    var tmpArr = new Array();
    for (var i in arr) {
      var ele = arr[i];
      var tmp = "\"" + ele + "\": \"http: //example.org/property/" + _type_name + "#" + ele + "\"";
      if (i != arr.length - 1)
        tmp += ",";
      tmpArr.push(tmp);
    }
    return tmpArr;
  }

  function profixModify(arr) {
    var tmpArr = new Array();
    for (var i in arr) {
      var ele = arr[i];
      var tmp = "\"" + ele + "\": \"" + _type_name + "\"";
      if (i != arr.length - 1)
        tmp += ",";
      tmpArr.push(tmp);

    }
    return tmpArr;
  }

  function stringmaker(head, arr, tail) {
    var tmpString = head;
    for (var key in arr) {
      var ele = arr[key];
      tmpString += tab + tab + ele + "\n";
    }
    tmpString += tail;
    return tmpString;
  }
  return promised.write_file(_file_name, outputString);
}
exports.typeFileGenerator = typeFileGenerator;


/**
 * @method typeRegister
 *   regist a user defined data type
 *
 * @param info
 *  object,format as below:
 *   {
 *         type_name:"document",          //value is a string piece
 *         func_content:function(){},  //value should be a function object
 *          property: [xxx,aaa,bbb]       //array of kinds if properties
 *          postfix: [xa,xf,xaq]              //array of postfix for this kind of data type
 *    }
 *
 */
function typeRegister(info) {
  return methodGenerator(info)
    .then(function() {
      return typeFileGenerator(info.type_name, info.property, info.postfix);
    })
    .then(function() {
      return refreshConfFile();
    })
    .then(function() {
      rdfHandle.refreshTypeInfo();
    });
}
exports.typeRegister = typeRegister;


/**
 * @method propertyAdder
 *   add user defined property on a specific data type
 *
 * @param info
 *  object,format as below:
 *   {
 *         type_name:"document",          //value is a string piece
 *          property: [xxx,aaa,bbb]       //array of kinds if properties
 *    }
 *
 */
function propertyAdder(info) {
  /*TODO: to be continue*/
}


/*TODO: needs more consideration*/
// function propertyRemover() {

// }

// function propertyRegiser(op, info) {
//   if (op === "add") {
//     return propertyAdder(info);
//   } else if (op === "remove") {
//     return propertyRemover(info);
//   } else {
//     var _err = new Error("NOT A VLID OP STR...");
//     throw _err;
//   }
// }


/**
 * @method postfixRegister
 *   to regist a postfix to specific data type
 *
 * @param info
 *  object,format as below:
 *   {
 *         type_name:"document",          //value is a string piece
 *          postfix: [xxx,aaa,bbb]       //array of kinds if postfix
 *    }
 *
 */
function postfixRegister(info) {
  var _type_name = info.type_name;
  var _postfix_list = info.postfix;
  //get type file path from typeDefine.con
  return readFile(TYPECONFPATH)
    .then(function(config_info_) {
      var _type_file_path = config_info_["property"][_type_name];
      //read current type file content
      return readFile(_type_file_path)
        .then(function(type_info_) {
          for (var i = 0, l = _postfix_list.length; i < l; i++) {
            type_info_.postfix[_postfix_list[i]] = _type_name;
          }
          var type_info_str_ = JSON.stringify(type_info_, null, 4);
          //re-write the type file
          return promised.write_file(_type_file_path, type_info_str_);
        });
    })
    //refresh typeDefine.conf
    .then(refreshConfFile());
}
exports.postfixRegister = postfixRegister;