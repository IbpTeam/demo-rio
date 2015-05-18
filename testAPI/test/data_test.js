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

//data.loadResources(loadResCb,"/home/rtty/WORKDIR/resources");
//data.getAllContacts(cb1);

function loadConCb(res){
  console.log("LLLLoading",res);
}

//data.loadContacts(loadConCb,"/home/rtty/WORKDIR/resources/contacts/contacts.CSV");

function getAllcataCb(result){
  console.log(result);
}

//data.getAllCate(getAllcataCb);

//data.getAllDataByCate(getAllcataCb,"Picture");
/*
data.rmDataByUri(function(err){
  console.log(err,"Testing");
}, "undefined#2dd48e7f723db8c78b12#contact");
*/


data.getDataByUri(function(res){
  console.log(res);
},"undefined#b6ef889b5b05cfae72e6#picture");