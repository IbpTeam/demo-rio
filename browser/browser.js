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

function opendir()
{
    td=document.getElementById(this.id);
    console.log("文件夹"+td.textContent);
    paths.push(td.textContent);
    var path="";
    for(var i=0;i<paths.length;i++)
        path+=paths[i]+"/";
    dirpath.textContent=path;
    console.log(getText("js/browser.html", callback));
}
function appendtr(table, content)
{
    var id=table.children.length;
    tr = document.createElement("tr");
    tr.id = "tr"+id;
    for(var i=0;i<4;i++){
        if(content[i]==undefined)
            continue;
        td = document.createElement("td");
        td.id=4*id+i;
        td.className="out";
        td.width="100";
        td.height="100";
        td.onclick=opendir;
        td.onmouseover=function(){this.className="over";};
        td.onmouseout=function(){this.className="out";};
        td.textContent=content[i];
        tr.appendChild(td);
    }
    table.appendChild(tr);
}

function loadfiles(){
    var table=document.getElementById("table-files");
    var content=["音乐", "视频", "图像","游戏", "联系人"];
    for(var i=0;i<content.length/4+1;i++){
        appendtr(table, content.slice(i*4, (i+1)*4));
    }
//for(var i=0;i<table.children.length;i++){
//  console.log(table.children[i]);}
}
window.onload=loadfiles;

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

