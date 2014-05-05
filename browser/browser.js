var paths=[];
var dirpath=document.getElementById("label-paths");
//console.log(dirpath);

function getTextSync(url)
{
    var request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send(null);
    if(request.status !== 200)
    {
        throw new Error(request.statusText);
    }
    var type=request.getResponseHeader("Content-Type");
    if(!type.match(/^text/))
    {
        throw new Error("Expected textual response; got: " + type);
    }
    return request.responseText;
}
function callback(text)
{
    console.log(text);
}
function getText(url, callback)
{
    var request=new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function(){
        if(request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader("Content-Type");
            console.log("type:"+type);
            if(type.match(/^text/))
                callback(request.responseText);
         }
    };
    request.send(null);
}
function postText(url, callback)
{
    var request=new XMLHttpRequest();
    request.open("POST", url);
    request.onreadystatechange = function(){
        if(request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader("Content-Type");
            if(type.match(/^text/))
                callback(request.responseText);
         }
    };
    request.setRequestHeader("Content-Type", "application/json")
    request.send(null);
}
var content_json='';
var file_arch_json={
"root":[
    {"id":"0", "name":"音乐"},
    {"id":"1", "name":"视频"}, 
    {"id":"2", "name":"图像"},
    {"id":"3", "name":"游戏"},
    {"id":"4", "name":"联系人"},
    {"id":"5", "name":"电子书"},
    {"id":"6", "name":"小说"},
    {"id":"7", "name":"电影"},
    {"id":"8", "name":"歌曲"}
    ],
"root/音乐":[
    {"id":"0", "name":"音乐.mp3"},
    {"id":"1", "name":"视频.mp3"}, 
    {"id":"2", "name":"图像.mp3"},
    {"id":"3", "name":"游戏.mp3"},
    {"id":"4", "name":"联系人.mp3"},
    {"id":"5", "name":"电子书.mp3"},
    {"id":"6", "name":"小说.mp3"},
    {"id":"7", "name":"电影.mp3"},
    {"id":"8", "name":"歌曲.mp3"}
    ],
};
function test(){
console.log("in test function.")
}
function open_exist_dir()
{
    dir_ele = document.getElementById(this.id);
    dirname = dir_ele.innerHTML;
    var path_ele = document.getElementById("path");
    var dirs = [];
    for(var child = path_ele.firstElementChild; child != null; child = child.nextElementSibling){
        dirs.push(child.innerHTML);
        if(child == dir_ele){
            break;
        }
    }
    if(refresh_content_ele(dirs.join("/")) != null){
        dir_ele.className = "active";
        for(var child = dir_ele.nextElementSibling; child != null; child = child.nextElementSibling){
            path_ele.removeChild(child);
        }
    }else{
        alert("in open new dir: wrong path.");
    }
}

function open_new_dir(){
    dir_ele = document.getElementById(this.id);
    dirname = dir_ele.innerHTML;
    var path_ele = document.getElementById("path");
    var dirs = [];
    for(var child = path_ele.firstElementChild; child != null; child = child.nextElementSibling){
        dirs.push(child.innerHTML);
    }
    dirs.push(dirname);
    var new_li;
    if(refresh_content_ele(dirs.join("/")) != null){
        new_li = document.createElement("li");
        new_li.id = "dir_" + dirname;
        new_li.onclick = open_exist_dir;
        new_li.className = "active";
        new_li.appendChild(document.createTextNode(dirname));
        for(var child = path_ele.firstElementChild; child != null; child = child.nextElementSibling){
            child.className = "divider";
        }
        path_ele.appendChild(new_li);
    }else{
        alert("in open new dir: wrong path.");
    }
}

function open_root_dir()
{
//path=paths.join("/");
//console.log("open dir: " + path);
    var path_ele = document.getElementById("path");
    var root_li = document.createElement("li");
    root_li.appendChild(document.createTextNode("root"));
    root_li.id = "dir_" + "root";
    root_li.onclick = open_exist_dir;
    root_li.className = "active";
    for(var child = path_ele.firstChild; child != null; child = child.nextSibling){
        path_ele.removeChild(child);
    }
    path_ele.appendChild(root_li);
    refresh_content_ele("root");
}
function refresh_content_ele(path_str)
{
    var content_ele = document.getElementById("content");
    var content_width = content_ele.clientWidth;
    content_json = file_arch_json[path_str];
    if(content_json == null){
        return null;
    }
//    console.log("path:" + path_str + "\n" +content_json.length);
    var row = document.getElementById("content_row");
    if(row != null){
        content_ele.removeChild(row);
    }
    row = document.createElement("div");
    row.id = "content_row"
    row.className="page_row";
    var file;
    for(var i=0;i<content_json.length;i++){
        file = document.createElement("div");
        file.className = "file";
        file.id=content_json[i].id;
        file.onclick = open_new_dir;
        file.appendChild(document.createTextNode(content_json[i].name));
        row.appendChild(file);
    }
    content_ele.appendChild(row);
    function getValue(str){
        return parseInt(str.substring(0, str.length-2))
    }
    file_style=window.getComputedStyle(file);
    file_extral_space = getValue(file_style.marginRight) * 2 + getValue(file_style.borderLeftWidth) + getValue(file_style.borderRightWidth);
    file_offsetWidth = getValue(file_style.width) + file_extral_space;
    file_offsetHeight = getValue(file_style.height) + file_extral_space;
    row_style = window.getComputedStyle(row);
    row_width_extral = getValue(row_style.paddingLeft);
    cols = parseInt( (content_width - row_width_extral) / file_offsetWidth );
    row.style.width = (cols * file_offsetWidth + row_width_extral) + "px";
    row.style.height = ((parseInt(content_json.length/cols) + 1) * (file_offsetHeight) + row_width_extral) + "px";
    console.log("content_width: " + content_width);
    console.log("file_offsetWidth:  " + file_offsetWidth);
    console.log("row_width_extral: " + row_width_extral);
    console.log("cols: " + cols);
    console.log("row_width:" + row.style.width);
    console.log("row_height:" + row.style.height);
    console.log("row.style.height:" + (content_json.length/(content_width/file_offsetWidth)));
    return content_ele;
}
function loadfiles(){
    var content_ele=document.getElementById("content");
    var content_width=content_ele.clientWidth;
    //var content_json=file_arch_json[path_str];
    if(content_json == null){
        return null;
    }
    var row = document.getElementById("content_row");
    if(row != null){
        content_ele.removeChild(row);
    }
    row = document.createElement("div");
    row.id = "content_row"
    row.className="page_row";
    var file;
    for(var i=0;i<content_json.length;i++){
        file = document.createElement("div");
        file.className = "file";
        file.id=content_json[i].id;
        file.onclick = open_new_dir;
        file.appendChild(document.createTextNode(content_json[i].name));
        row.appendChild(file);
    }
    content_ele.appendChild(row);
    function getValue(str){
        return parseInt(str.substring(0, str.length-2))
    }
    file_style=window.getComputedStyle(file);
    file_extral_space = getValue(file_style.marginRight) * 2 + getValue(file_style.borderLeftWidth) + getValue(file_style.borderRightWidth);
    file_offsetWidth = getValue(file_style.width) + file_extral_space;
    file_offsetHeight = getValue(file_style.height) + file_extral_space;
    row_style = window.getComputedStyle(row);
    row_width_extral = getValue(row_style.paddingLeft);
    cols = parseInt( (content_width - row_width_extral) / file_offsetWidth );
    row.style.width = (cols * file_offsetWidth + row_width_extral) + "px";
    row.style.height = ((parseInt(content_json.length/cols) + 1) * (file_offsetHeight) + row_width_extral) + "px";
    console.log("content_width: " + content_width);
    console.log("file_offsetWidth:  " + file_offsetWidth);
    console.log("row_width_extral: " + row_width_extral);
    console.log("cols: " + cols);
    console.log("row_width:" + row.style.width);
    console.log("row_height:" + row.style.height);
    console.log("row.style.height:" + (content_json.length/(content_width/file_offsetWidth)));
    return content_ele;
}
window.onload=open_root_dir;
window.onresize=loadfiles;






//  log = document.createElement("tr");
//  log.id = "tr1";
//  log.innerHTML = "<td id='0' bgcolor='green' width='100' height='100' onclick='getid(this.id)'>文件夹0</td>";
//  table.appendChild(log);


//function loadfiles(){
//  document.write("<hr color=\"red\" />");                         // Begin an HTML table
//  document.write("<table border=\"1\" align='center'>");                         // Begin an HTML table
//  document.write("<caption>File Browser</caption>");  // Output table header
//  var files=[]
//  for(var i=0; i<16; i++){
//      files.push("文件夹"+i)
//  }
//  for(var i=0; i<4; i++){
//      document.write("<tr>");
//      for(var j=0; j<4; j++) {                     // Output 10 rows
//        document.write("<td id=" + (i*4+j)  + " onclick=\"getid(this.id)\">" + files[i*4+j]  + "</td>");
//      }
//      document.write("</tr>");
//  }
//  document.write("</table>");
//}

