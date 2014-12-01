//因为现在还没有支持数据的API，所以先用这个函数模拟一下。他返回的是所需要的文件。
function GetVideoFiles(){
  var video = new Array();
  video[0] = '<video src="../../../resources/video/movie.ogg" controls="controls"> </video>';
  video[1] = '<video src="../../../resources/video/movie.ogg" controls="controls"> </video>';
  video[2] = '<video src="../../../resources/video/mov_bbb.ogg" controls="controls"> </video>';
  video[3] = '<video src="../../../resources/video/火力全开.ogg" controls="controls"> </video>';
  video[4] = '<video src="../../../resources/video/我的歌声里.ogg" controls="controls"> </video>';
  video[5] = '<video src="../../../resources/video/因为有你.ogg" controls="controls"> </video>';
  return video;
}
function GetPictureFiles(){
  var picture = new Array();
  picture[0] = '<img src= "../../../resources/pictures/boy.jpg"></img>';
  picture[1] = '<img src= "../../../resources/pictures/boy.jpg"</img>';
  picture[2] = '<img src= "../../../resources/pictures/cat.jpg"</img>';
  picture[3] = '<img src= "../../../resources/pictures/city1.jpg"</img>';
  picture[4] = '<img src= "../../../resources/pictures/city2.jpg"</img>';
  picture[5] = '<img src= "../../../resources/pictures/city3.jpg"</img>';
  picture[6] = '<img src= "../../../resources/pictures/city4.jpg"</img>';
  picture[7] = '<img src= "../../../resources/pictures/city5.jpg"</img>';
  picture[8] = '<img src= "../../../resources/pictures/girl1.jpg"</img>';
  picture[9] = '<img src= "../../../resources/pictures/girl2.jpg"</img>';
  picture[10] = '<img src= "../../../resources/pictures/girl3.jpg"</img>';
  picture[11] = '<img src= "../../../resources/pictures/Penguins.jpg"</img>';
  picture[12] = '<img src= "../../../resources/pictures/vessel1.jpg"</img>';
  picture[13] = '<img src= "../../../resources/pictures/vessel2.jpg"</img>';
  picture[14] = '<img src= "../../../resources/pictures/vessel2_copy.jpg"</img>';
  return picture;
}

//此函数作用是按照列表来显示所有的文件,文件包括图片，音乐，视频，和文档。
function ShowFilesNormal(files){
  var result = [];
  //var test = [];
  var PictureStyleBegin = '<div class="outContainer"> <div class="Holder">';
  var PictureStyleEnd = ' </div> <div class="description">this is a picture</div></div>';
  for(var i=0;i<files.length;i++){
    result.push(PictureStyleBegin);
    result.push(files[i]);
    result.push(PictureStyleEnd);
  }
  document.getElementById("contentDiv").innerHTML = result.join(" ");
}
//此函数用来列表输出所有的文件，包括图片，音乐，视频和文档.
//ShowFilesNormal(GetPictureFiles());