
  var categoryDAO = require('./DAO/CategoryDAO');

  categoryDAO.findAll(findAllCallBack);

 
function findAllCallBack(err, rows){
  var category = new Array();
  rows.forEach(function (row){
    category.push({
      id:row.id,
      type:row.type,
      desc:row.desc
    });
  });
  console.log(category);
}
