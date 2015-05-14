var data = require('../../nodewebkit/lib/api/data.js');

function cb(cate) {
  var i;
  for (i = 0; i < cate.length; i += 1) {
    console.log(cate[i].id);
    console.log(cate[i].type);
    console.log(cate[i].path);
  }

}

function cb1(res){
  var i;
    console.log(res[0].URI);
    console.log(res[0].version);
    console.log(res[0].name);
    console.log(res[0].photPath);
}


function loadResCb(err,result){
  if (err) {
    console.log(err);
  };
  console.log("TTTTTTTTTTT"+result);
}

data.loadResources(loadResCb,"/home/rtty/WORK_DIR/resources");
//data.getAllContacts(cb1);