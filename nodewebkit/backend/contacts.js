var commonDAO = require("./DAO/CommonDAO");
var fs = require('fs');
var config = require('./config');

/**
 * @method getAllContacts
 *   获得所有联系人数组
 *
 * @param1 getAllContactsCb
 *   回调函数
 *   @result
 *     array[cate]: 联系人数组
 *        cate数据如下：
 *        cate{
 *           URI;
 *           version;
 *           name;
 *           photPath;
 *        }
 */
function getAll(getAllCb) {
  function getAllByCaterotyCb(data)
  {
    var contacts = new Array();
    data.forEach(function (each){
      contacts.push({
        URI:each.URI,
        version:each.version,
        name:each.name,
        photoPath:each.path
      });
    });
    getAllCb(contacts);
  }
  commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
}
exports.getAll = getAll;
