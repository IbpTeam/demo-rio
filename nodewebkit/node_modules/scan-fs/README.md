scan-fs
=======

##目的(Purpose)
Scans the file system in nodejs.


在nodejs环境下扫描文件系统的工具。

##安装(Install)
<pre>
  npm install scan-fs
</pre>

##创建(Create)
<pre>
  var scanFS = require('scan-fs').create();
</pre>

###添加不需要扫描的目录或文件:
`scanFS.exclude(filters)`: filters可以为正则表达式、Function和带`*`的字符串，当然也可以为它们组成的数组。

###事件(Events)，按照事件触发顺序排序:
* `error` - 发生错误时触发的事件。一个参数：err
* `path` - 扫描到每一个路径都会触发这个事件。两个参数：path, eOpts。eOpts对象包含path(路径)、stat(`fs.Stats`)、parent(所在目录)。
* `root` - 扫描到跟时触发的事件。两个参数：path, eOpts。eOpts对象包含path(路径)、stat(`fs.Stats`)、parent(所在目录)。
* `file` - 扫描到文件时触发的事件。两个参数：filename, eOpts。eOpts对象包含path(路径)、stat(`fs.Stats`)、parent(所在目录)
* `directory` - 扫描到目录时触发的事件。两个参数：path, eOpts。eOpts对象包含path(路径)、stat(`fs.Stats`)、parent(所在目录)。
* `complete` - 扫描完成时触发的事件。两个参数：fileCount、dirCount。扫描到文件的总数和目录的总数。

###添加事件方法:
* `scanFS.listeners(object)` - object必须，返回scanFS对象。
<pre>
	scanFS.listeners({
		'err': function(err){
			//...
		},
		'path': function(err){
			//...
		}
		//...
	});
</pre>
* 调用方法添加处理事件`onError`、`onPath`、`onRoot`、`onFile`、`onDirectory`、`onComplete`
<pre>
	scanFS.onError(function(err){
		//...
	}).onPath(function(path, eOpts){
		//...
	}).onFile(function(filePath, eOpts){
		//...
	})
	//...
</pre>

例子(Example)：
-----
```js
var scanFS = require('scan-fs' ).create();
//scanFS.exclude(__filename);
//scanFS.exclude(/dir.*/);
scanFS.exclude('*dir*');
/*scanFS.exclude(['*index.js']);
 scanFS.exclude(/.*index.js$/);
 scanFS.exclude(new RegExp(/.*index.js$/));*/

scanFS.listeners({
	'file': function(filePath, eOpts){
		console.log('File: ' + filePath);
	},
	'directory': function(path, eOpts){
		console.log('Directory: ' + path);
	},
	'error': function(err){
		console.log('err:' , err);
	},
	'complete': function(fileCount, dirCount){
		console.log('complete: ' + fileCount + ' files, ' + dirCount + ' directory')
	},
	'root': function(path, eOpts){
		console.log('root: ' + path);
	},
	'path': function(path, eOpts){
		console.log('path: ' + path);
	}
	}).setRecursive(true).scan('/home/lg/workspace/nodejs');
```
