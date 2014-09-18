var commonDAO = require("./DAO/CommonDAO");
var config = require('./config');


/**
 * @method getAllCate
 *   查询所有基本分类
 *
 * @param1 getAllCateCb
 *   回调函数
 *   @result
 *     array[cate]: 分类数组
 *        cate{
 *           id;
 *           type;
 *           path;
 *        }
 */
function getAll(getAllCb) {
  function getCategoriesCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        URI:each.id,
        version:each.version,
        type:each.type,
        path:each.logoPath,
        desc:each.desc
      });
    });
    getAllCb(cates);
  }
  commonDAO.getCategories(getCategoriesCb);
}
exports.getAll = getAll;

/**
 * @method getAllDataByCate
 *   查询某基本分类下的所有数据
 *
 * @param1 getAllDataByCateCb
 *   回调函数
 *   @result
 *     array[cate]: 数据数组
 *        如果是联系人，则返回数据如下：
 *        cate{
 *           URI;
 *           version;
 *           name;
 *           photPath;
 *        }
 *        如果是其他类型，则返回数据如下：
 *        cate{
 *           URI;
 *           version;
 *           filename;
 *           postfix;
 *           path;
 *        }
 */
function getAllData(getAllData,cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  if(cate == 'Contacts'){
    getAllContacts(getAllDataByCateCb);
    return;
  }else {
    function getAllByCaterotyCb(data)
    {
      var cates = new Array();
      data.forEach(function (each){
        cates.push({
          URI:each.URI,
          version:each.version,
          filename:each.filename,
          postfix:each.postfix,
          path:each.path
        });
      });
      getAllData(cates);
    }
    commonDAO.getAllByCateroty(cate,getAllByCaterotyCb);
  }
}
exports.getAllData = getAllData;