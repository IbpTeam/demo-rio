function create_rmenu(){
	menu= document.createElement("ul");
    menu.id = 'rmenu';
    var menu_content = ['打开', '删除', '查看属性'];
    var item;
    for(var i=0;i<menu_content.length;i++){
        item = document.createElement("li");
        item.className = "item";
        switch(menu_content[i]){
        case '打开':
            item.onclick = open_new_dir;
        	break;
        case '删除':
            item.onclick = delete_file;
        	//console.log('delete file');
        	break;
        case '查看属性':
            item.onclick = get_property_of_file;
        	//console.log('property of file');
        	break;
        }
        item.appendChild(document.createTextNode(menu_content[i]));
        menu.appendChild(item);
    }
    return menu;	
}
function popup_rmenu(ev)  //oncontextmenu事件为鼠标右键
{
    var oEvent = ev||event;
    var scrollTop = document.documentElement.scrollTop||document.body.scrollTop;  //获取上下滚动条
    var scrollLeft = document.documentElement.scrollLeft||document.body.scrollLeft;  //获取左右滚动条
    var oUl = document.getElementById('rmenu');  //获取UL
    oUl.style.display = 'block';
    oUl.style.left = oEvent.clientX + scrollLeft + 'px';  //设置X轴的位置
    oUl.style.top = oEvent.clientY + scrollTop + 'px';    //设置Y轴的位置
    //console.log('scroll: %d - %d', document.documentElement.scrollLeft, document.documentElement.scrollTop);
    //console.log('pos: %d - %d', oUl.style.left, oUl.style.top);
    return false;  //阻止浏览器默认事件
};
function close_rmenu()
{
    var menu=document.getElementById('rmenu');
    menu.style.display='none';
    //console.log('close right menu');
}

//use for get current file info
//used by file_on_mouse_down, open_new_dir.
function get_cur_file_info_by_id(id){
	file_to_operate_id = id;	
	element_to_operate = document.getElementById(id);
	switch(cur_dir_path){
        case 'root':
	    file_to_operate_name = get_json_by_id(cur_dir_path, file_to_operate_id).type;
        break;
        case 'root/Pictures':
	    file_to_operate_name = get_json_by_id(cur_dir_path, file_to_operate_id).filename;
        break;
        case 'root/Contacts':
	    file_to_operate_name = get_json_by_id(cur_dir_path, file_to_operate_id).name;
        break;
        case 'root/Videos':
	    file_to_operate_name = get_json_by_id(cur_dir_path, file_to_operate_id).name;
        break;
	}
	//element_to_operate.innerHTML;	
}
function get_json_by_id(path, id){
//	console.log('file_arch_json:%r', file_arch_json);
//	console.log('file_arch_json:%r', file_arch_json[path]);
//	console.log('path:'+ path);
//	console.log('id:'+ id);
	var result = false;
	if(file_arch_json[path]){
		for(var i=0; i<file_arch_json[path].length; i++){
			if(id == file_arch_json[path][i].id){
				result = file_arch_json[path][i];
			}
		}
	}
	return result;
}
function open_exist_dir()
{
	var d_id;
	if(null == this.id){
		d_id = file_to_operate_id;
	}else{
		d_id = this.id;
		file_to_operate_id = d_id;
	}
    var dir_ele = document.getElementById(d_id);
    var dirname = dir_ele.innerHTML;
    //console.log('in open exist dir:%d - %d', file_to_operate_id, this.id);
    var path_ele = document.getElementById("id_path");
    var dirs = [];
    for(var child = path_ele.firstElementChild; child != null; child = child.nextElementSibling){
        dirs.push(child.innerHTML);
        if(child == dir_ele){
            break;
        }
    }
    cur_dir_path = dirs.join("/");
    if(refresh_content_by_path(cur_dir_path) != null){
        dir_ele.className = "active";//
        //console.log('in open exist dir:' + dir_ele.nextElementSibling);
        if(null != dir_ele.nextElementSibling){
        	for(var child = dir_ele.nextElementSibling; child != null; child = child.nextElementSibling){
        		path_ele.removeChild(child);
        	}
        }
    }else{
        alert("in open new dir: wrong path.");
    }
}

function open_new_dir(){
	var d_id;
	if(this.id){
		d_id = this.id;
		get_cur_file_info_by_id(d_id);
	}else{
		d_id = file_to_operate_id;
	}
//    console.log('in open new dir:%d - %d', file_to_operate_id, this.id);
//    console.log('pos: %d - %d', dir_ele.offsetTop, dir_ele.offsetTop);
	var cur_json;

if(file_to_operate_name == 'Contacts'){
    getAllContacts(get_cur_dir_data);
}else
	if(cur_json = get_json_by_id(cur_dir_path, file_to_operate_id)){
		//console.log('current json:'+ cur_json);
		if('dir' == cur_json.prop){
		    getAllDataByCate(get_cur_dir_data, file_to_operate_name);			
		}else{
			if(cur_json = get_json_by_id(cur_dir_path, file_to_operate_id)){
				var file_propery='';
				for(var key in cur_json){
					file_propery += key + ':' + cur_json[key] + '\n';
				}
				alert(file_propery);
			}
		}
	}
}
function get_cur_dir_data(text){
    console.log('data from server:'+text)
    //var json_obj = JSON.parse(text);
    var json_obj = text;
    if(0 == json_obj.length){
    	alert('文件夹内容为空');
    	return false;
    }else{
        var path_ele = document.getElementById("id_path");
        var dirs = [];
        for(var child = path_ele.firstElementChild; child != null; child = child.nextElementSibling){
            dirs.push(child.innerHTML);
        }
        dirs.push(file_to_operate_name);
        cur_dir_path = dirs.join("/");
		file_arch_json[cur_dir_path] = json_obj;
	}
    var new_li;
    if(refresh_content_by_path(cur_dir_path) != null){
        new_li = document.createElement("li");
        new_li.id = "dir_" + file_to_operate_name;
        new_li.onclick = open_exist_dir;
        new_li.className = "active";
        new_li.appendChild(document.createTextNode(file_to_operate_name));
        for(var child = path_ele.firstElementChild; child != null; child = child.nextElementSibling){
            child.className = "divider";
        }
        path_ele.appendChild(new_li);
    }else{
        alert("in open new dir: wrong path.");
    }
}
function json_append_prop(text){
	//json_obj = JSON.parse(text);
	json_obj = text;
	for(var i=0; i<json_obj.length; i++){
		json_obj[i]['prop'] = 'dir';
	}
	return json_obj;
}
function open_root_dir()
{
	//get_root_data();
	//console.log(file_arch_json["root"]);
    var path_ele = document.getElementById("id_path");
    var root_li = document.createElement("li");
    root_li.appendChild(document.createTextNode("root"));
    root_li.id = "dir_" + "root";
    root_li.onclick = open_exist_dir;
    root_li.className = "active";
    for(var child = path_ele.firstChild; child != null; child = child.nextSibling){
        path_ele.removeChild(child);
    }
    path_ele.appendChild(root_li);    
    getAllCate(get_root_data);
}
function get_root_data(text){
    //console.log('data from server:'+text)
    cur_dir_path = 'root';
	file_arch_json[cur_dir_path] = json_append_prop(text);
	
	console.log(file_arch_json[cur_dir_path]);
	if(file_arch_json[cur_dir_path] ){
		refresh_content_by_path(cur_dir_path);
	}else{
		alert('can not get data from server.')
	}
}
//getAllCate(get_root_data);
function json_splice_by_id(){
    for(var i=0; i<content_json.length; i++)
    {
        if(content_json[i].id == file_to_operate_id){
            break;
        }
    }
	content_json.splice(i, 1);
}
function delete_file(){
	//console.log('current id:' + file_to_operate_id);
	var file_name = document.getElementById(file_to_operate_id).innerHTML;
	var value = confirm('file ' + file_name + ' will be deleted?');
	if(value == true){
		json_splice_by_id();
		//content_json.splice(file_to_operate_id, 1);
		//console.log('value:' + value);
	}
	refresh_content();
}
function get_property_of_file(){
	if(cur_json = get_json_by_id(cur_dir_path, file_to_operate_id)){
		var file_propery='';
		for(var key in cur_json){
			file_propery += key + ':' + cur_json[key] + '\n';
		}
		alert(file_propery);
	}
}
function getScrollOffsets(w){
    w = w || window;
    // 除IE8及以前版本不克不及用
    if(w.pageXOffset != null) return{x:w.pageXOffset, y:pageYOffset};
    // 对标准模式下的IE（或者任何浏览器）
    var d = w.document;
    if(document.cmpatMode == "CSS1Compat"){
         return{x:d.body.scrollLeft, y:d.body.scrllTop};
    }
    // 对怪异模式下的浏览器
    else{return{x:d.documentElement.scrollLeft, y:d.documentElement.scrollTop};
    }
}
//for event:
//1. mouse move
//2. long press
//3. right click
function file_on_mouse_down(event){
	get_cur_file_info_by_id(this.id);
    //console.log('event.button' + event.button);
//	if(2 == event.button){
//        return false;
//	}else{
//	    close_rmenu();	
//	}
    // guess function state.
    var func_state = -1;
    var state_mouse_move = 0;
    var state_left_click = 1;
    var state_left_long_press = 2;
    var state_right_click = 3;    
    switch(event.button)
    {
    case 0:
    	func_state = state_left_click;
    	break;
    case 2:
    	func_state = state_right_click;
    	//popup_rmenu(event);
    	//return false;
    	break;
    }
	elementToDrag = this;
    // The initial mouse position, converted to document coordinates
    var scroll = getScrollOffsets();  // A utility function from elsewhere
    var startX = event.clientX + scroll.x;
    var startY = event.clientY + scroll.y;

    // The original position (in document coordinates) of the element
    // that is going to be dragged.  Since elementToDrag is absolutely
    // positioned, we assume that its offsetParent is the document body.
    var origX = elementToDrag.offsetLeft;
    var origY = elementToDrag.offsetTop;

    // Compute the distance between the mouse down event and the upper-left
    // corner of the element. We'll maintain this distance as the mouse moves.
    var deltaX = startX - origX;
    var deltaY = startY - origY;
	//console.log('in (file on mouse down) event:' + event);
	//console.log('start: %s - %s', startX, startY);
	//console.log('origin: %s - %s', origX, origY);
	//console.log('delta: %s - %s', deltaX, deltaY);

	// start time count
	var time_cnt = 0;
    timer = setInterval(function() {
    	time_cnt += 10;
        if (time_cnt >= 250) {
            clearInterval(timer);
            popup_rmenu(event);
            func_state = state_left_long_press;
            //alert('time out');
        }
    }, 10)
    
    // Register the event handlers that will respond to the mousemove events
    // and the mouseup event that follow this mousedown event.
    if (document.addEventListener) {  // Standard event model
        // Register capturing event handlers on the document
        document.addEventListener("mousemove", moveHandler, true);
        document.addEventListener("mouseup", upHandler, true);
    }
    else if (document.attachEvent) {  // IE Event Model for IE5-8
        // In the IE event model, we capture events by calling
        // setCapture() on the element to capture them.
        elementToDrag.setCapture();
        elementToDrag.attachEvent("onmousemove", moveHandler);
        elementToDrag.attachEvent("onmouseup", upHandler);
        // Treat loss of mouse capture as a mouseup event.
        elementToDrag.attachEvent("onlosecapture", upHandler);
    }

    // We've handled this event. Don't let anybody else see it.
    if (event.stopPropagation) event.stopPropagation();  // Standard model
    else event.cancelBubble = true;                      // IE

    // Now prevent any default action.
    if (event.preventDefault) event.preventDefault();   // Standard model
    else event.returnValue = false;                     // IE
    function out_of_content_row(left, top){
    	var right = left + file_width;
    	var bottom = top + file_height;
    	var out_of_range = false;
    	if((right < content_row_left) || (left > content_row_right) || (top > content_row_bottom) || (bottom < content_row_top)){
    		out_of_range = true;
    	}
    	return out_of_range;
    }

    /**
     * This is the handler that captures mousemove events when an element
     * is being dragged. It is responsible for moving the element.
     **/
    function moveHandler(e) {
    	func_state = state_mouse_move;
        if (!e) e = window.event;  // IE event Model
        // Move the element to the current mouse position, adjusted by the
        // position of the scrollbars and the offset of the initial click.
        var scroll = getScrollOffsets();
        var left = (e.clientX + scroll.x - deltaX);
        var top = (e.clientY + scroll.y - deltaY);
        elementToDrag.style.left = left + "px";
        elementToDrag.style.top = top + "px";
        console.log('in moveHandler: %d - %d', left, top);
    	//console.log('element position: %s - %s', elementToDrag.style.left, elementToDrag.style.top);
        if(out_of_content_row(left, top)){
        	//left = origX;
            //top = origY;
        	delete_file();
        	upHandler(e);
        }
        // And don't let anyone else see this event.
        if (e.stopPropagation) e.stopPropagation();  // Standard
        else e.cancelBubble = true;                  // IE
    	clearInterval(timer);
    }

    /**
     * This is the handler that captures the final mouseup event that
     * occurs at the end of a drag.
     **/
    function upHandler(e) {
        if (!e) e = window.event;  // IE Event Model

        // Unregister the capturing event handlers.
        if (document.removeEventListener) {  // DOM event model
            document.removeEventListener("mouseup", upHandler, true);
            document.removeEventListener("mousemove", moveHandler, true);
        }
        else if (document.detachEvent) {  // IE 5+ Event Model
            elementToDrag.detachEvent("onlosecapture", upHandler);
            elementToDrag.detachEvent("onmouseup", upHandler);
            elementToDrag.detachEvent("onmousemove", moveHandler);
            elementToDrag.releaseCapture();
        }

        // And don't let the event propagate any further.
        if (e.stopPropagation) e.stopPropagation();  // Standard model
        else e.cancelBubble = true;                  // IE

//    	clearInterval(timer);
//    	refresh_content();
        switch(func_state)
        {
        case state_left_click:
        	clearInterval(timer);
        	open_new_dir();
        	break;
        case state_right_click:
        case state_left_long_press:
        	clearInterval(timer);
        	refresh_content();
        	break;
        case state_mouse_move:
        	clearInterval(timer);
        	refresh_content();
        	break;
        }
    }
}
//get_cur_file_info_by_id
//open_new_dir
//create_div_by_path
function create_div_by_path(path_str, json_obj)
{
    var file = document.createElement("div");
    file.className = "file";
    file.id = json_obj.id;
    //file.onclick = open_new_dir;
    file.oncontextmenu = popup_rmenu;
    file.onmousedown = file_on_mouse_down;
    switch(path_str)
    {
        case 'root':
            var img = document.createElement("img");
            img.src = '.'+json_obj.path;//
            img.width = 95;
            img.height = 70;
            file.appendChild(img);
            file.appendChild(document.createTextNode(json_obj.type));
        break;
        case 'root/Pictures':
            var img = document.createElement("img");
            img.src = '../resources/pictures/'+json_obj.filename+'.'+json_obj.postfix;
            img.width = 95;
            img.height = 70;
            file.appendChild(img);
            file.appendChild(document.createTextNode(json_obj.filename));
        break;
        case 'root/Contacts':        
            var img = document.createElement("img");
            img.src = '.'+json_obj.photoPath;//
            img.width = 95;
            img.height = 70;
            file.appendChild(img);
            file.appendChild(document.createTextNode(json_obj.name));
        break;
        case 'root/Videos':
            file.appendChild(document.createTextNode(json_obj.name));
        break;
    }
    return file;
}
var file_margin_right;
var file_extral_space;
var file_width;
var file_height;
var file_offset_width;
var file_offset_height;

var content_row_left;
var content_row_top;
var content_row_width;
var content_row_height;
var content_row_right;
var content_row_bottom;
function refresh_content_by_path(path_str)
{
    var content_ele = document.getElementById("id_content");
    var content_width = content_ele.clientWidth;
    content_json = file_arch_json[path_str];
    if(content_json == null){
        return null;
    }
    //console.log("in function refresh element element:" + file_arch_json);
    //console.log("in function refresh element element:" + path_str + "\n" + JSON.stringify(content_json));
    var content_row = document.getElementById("id_content_row");
    if(content_row != null){
        content_ele.removeChild(content_row);
    }
    content_row = document.createElement("div");
    content_row.id = "id_content_row";
    content_row.className = "style_content_row";
    var file;
    for(var i=0;i<content_json.length;i++){
        file = create_div_by_path(path_str, content_json[i]);
        content_row.appendChild(file);
    }
    content_ele.appendChild(content_row);
    function getValue(str){
        return parseInt(str.substring(0, str.length-2))
    }
    file_style = window.getComputedStyle(file);
    file_margin_right = getValue(file_style.marginLeft);
    file_extral_space = file_margin_right * 2 + getValue(file_style.borderLeftWidth) + getValue(file_style.borderRightWidth);
    file_width = getValue(file_style.width);
    file_height = getValue(file_style.height);
    file_offset_width = file_width + file_extral_space;
    file_offset_height = file_height + file_extral_space;
    content_row_style = window.getComputedStyle(content_row);
    //console.log('content_row_style:%r', content_row_style);
    content_row_width_extral = getValue(content_row_style.paddingLeft);
    var cols_per_row = parseInt( (content_width - content_row_width_extral) / file_offset_width );
    content_row_width = cols_per_row * file_offset_width + content_row_width_extral;
    content_row_height = (parseInt(content_json.length/cols_per_row) + 1) * (file_offset_height) + content_row_width_extral;
    content_row.style.width = content_row_width + "px";
    content_row.style.height = content_row_height + "px";
    //notice: correct value get must after content_row_width is set.
    content_row_left = content_row.offsetLeft;//content_row_style.left;
    content_row_top = content_row.offsetTop;//content_row_style.top;
	content_row_right = content_row_left + content_row_width;
	content_row_bottom = content_row_top + content_row_height;
//    console.log("content_width: " + content_width);
//    console.log("file_extral_space:  " + file_extral_space);
//    console.log("file_offset_width:  " + file_offset_width);
//    console.log("file_offset_height:  " + file_offset_height);
//    console.log("content_row_left:  " + content_row_left);
//    console.log("content_row_top:  " + content_row_top);
//    console.log("content_row_width_extral: " + content_row_width_extral);
//    console.log("cols_per_row: " + cols_per_row);
//    console.log("content_row_width:" + content_row_width);
//    console.log("content_row_height:" + content_row_height);
    var child = null;
    var row_cnt = 0;
    var col_cnt = 0;
    var pos_cnt = 0;
    for(child = content_row.firstElementChild; child != null; child = child.nextElementSibling, pos_cnt++){
    	row_cnt = parseInt(pos_cnt / cols_per_row);
    	col_cnt = pos_cnt % cols_per_row;
    	file_left = content_row_left + content_row_width_extral + file_margin_right + file_offset_width * col_cnt;
    	file_top = content_row_top + content_row_width_extral + file_margin_right + file_offset_height * row_cnt;
    	child.style.left = file_left + 'px';
    	child.style.top = file_top + 'px';
//    	console.log('child' + pos_cnt + ': ' + file_left + ' - ' + file_top);
    }
    return content_ele;
}
//notice: difference between refresh_content_by_path and refresh_content
//1. path is not provided, content_json should comment;
//2. path_str is replaced by cur_dir_path;
function refresh_content(){
    var content_ele = document.getElementById("id_content");
    var content_width = content_ele.clientWidth;
    //content_json = file_arch_json[path_str];
    if(content_json == null){
        return null;
    }
    //console.log("in function refresh element element:" + file_arch_json);
    //console.log("in function refresh element element:" + path_str + "\n" + JSON.stringify(content_json));
    var content_row = document.getElementById("id_content_row");
    if(content_row != null){
        content_ele.removeChild(content_row);
    }
    content_row = document.createElement("div");
    content_row.id = "id_content_row";
    content_row.className = "style_content_row";
    var file;
    for(var i=0;i<content_json.length;i++){
        file = create_div_by_path(cur_dir_path, content_json[i]);
        content_row.appendChild(file);
    }
    content_ele.appendChild(content_row);
    function getValue(str){
        return parseInt(str.substring(0, str.length-2))
    }
    file_style = window.getComputedStyle(file);
    file_margin_right = getValue(file_style.marginLeft);
    file_extral_space = file_margin_right * 2 + getValue(file_style.borderLeftWidth) + getValue(file_style.borderRightWidth);
    file_width = getValue(file_style.width);
    file_height = getValue(file_style.height);
    file_offset_width = file_width + file_extral_space;
    file_offset_height = file_height + file_extral_space;
    content_row_style = window.getComputedStyle(content_row);
    //console.log('content_row_style:%r', content_row_style);
    content_row_width_extral = getValue(content_row_style.paddingLeft);
    var cols_per_row = parseInt( (content_width - content_row_width_extral) / file_offset_width );
    content_row_width = cols_per_row * file_offset_width + content_row_width_extral;
    content_row_height = (parseInt(content_json.length/cols_per_row) + 1) * (file_offset_height) + content_row_width_extral;
    content_row.style.width = content_row_width + "px";
    content_row.style.height = content_row_height + "px";
    //notice: correct value get must after content_row_width is set.
    content_row_left = content_row.offsetLeft;//content_row_style.left;
    content_row_top = content_row.offsetTop;//content_row_style.top;
	content_row_right = content_row_left + content_row_width;
	content_row_bottom = content_row_top + content_row_height;
    var child = null;
    var row_cnt = 0;
    var col_cnt = 0;
    var pos_cnt = 0;
    for(child = content_row.firstElementChild; child != null; child = child.nextElementSibling, pos_cnt++){
    	row_cnt = parseInt(pos_cnt / cols_per_row);
    	col_cnt = pos_cnt % cols_per_row;
    	file_left = content_row_left + content_row_width_extral + file_margin_right + file_offset_width * col_cnt;
    	file_top = content_row_top + content_row_width_extral + file_margin_right + file_offset_height * row_cnt;
    	child.style.left = file_left + 'px';
    	child.style.top = file_top + 'px';
    	//console.log('child' + pos_cnt + ': ' + file_left + ' - ' + file_top);
    }
    return content_ele;
}

var content_json='';
var file_arch_json={};
var dirpath;
var file_to_operate_id;
var element_to_operate;
var file_to_operate_name;
var cur_dir_path='';
function window_onload(){
	dirpath = document.getElementById("id_path");
	var rmenu = create_rmenu();
	document.body.appendChild(rmenu);
	open_root_dir();
}
window.onload = window_onload;
window.onresize = refresh_content;
document.onclick = close_rmenu;

// ready for obsolute.
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
function getcallback(text)
{
    console.log(text);
}
function getText(url)
{//, callback
    var request=new XMLHttpRequest();
    request.open("GET", url);
    request.onreadystatechange = function(){
    	console.log(request);
        if(request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader("Content-Type");
            console.log("type:"+type);
            if(type.match(/^text/))
            	getcallback(request.responseText);
         }
    };
    request.send(null);
}
function postText(url)
{//, callback
    var request=new XMLHttpRequest();
    request.open("POST", url);
    request.onreadystatechange = function(){
        if(request.readyState === 4 && request.status === 200) {
            var type = request.getResponseHeader("Content-Type");
            if(type.match(/^text/))
            	getcallback(request.responseText);
         }
    };
    request.setRequestHeader("Content-Type", "application/json")
    request.send(null);
}
