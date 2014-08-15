var fs = require('fs')
	, events = require('events')
	, util = require('util')
	, path = require('path')
	, Watch = function(){
		this.files = {};
		this.scanFS = require('scan-fs').create();

		var me = this;
		this.scanFS.listeners({
			'path': function(fspath, eOpts){
				me.__watch(fspath, null, eOpts);
			},
			'error': function(err){
				if(typeof me.__scanCallback === 'function')
					me.__scanCallback(err, 0, 0);
			},
			'complete': function(fileCount, dirCount){
				if(typeof me.__scanCallback === 'function')
					me.__scanCallback(null, fileCount, dirCount);
			}
		})

		events.EventEmitter.call(this);
	};
util.inherits(Watch, events.EventEmitter);


/**
 * 监视文件方法
 * @param filePath  文件路径
 * @private
 */
Watch.prototype.__watchFile = function (filePath){
	var me = this;

	return fs.watchFile(filePath, function(curr, prev){
		if(prev.mtime !== curr.mtime){
			if(!prev.isFile() && curr.isFile()){
				me.emit('create', filePath, curr);
				me.emit('createfile', filePath, curr);
			}

			if(!curr.isFile() && prev.isFile()){
				me.emit('delete', filePath, prev);
				me.emit('deletefile', filePath, prev);
				me.unwatchTree(filePath);
			}

			if(curr.isFile() && prev.isFile()){
				me.emit('change', filePath, curr);
				me.emit('changefile', filePath, curr);
			}
		}
	});
};

/**
 * 监视目录方法
 * @param dirPath   目录路径
 * @private
 */
Watch.prototype.__watchDirectory = function (dirPath){
	var me = this;

	return fs.watch(dirPath, function( event, fileName){

		var filePath = path.join(dirPath , fileName);

		fs.exists(filePath, function(exists){

			if(exists){
				fs.stat(filePath, function(err, stats){
					if(err){
						console.error(filePath, err);
					} else {
						if(event === 'rename'){
							if(!me.files[filePath]){
								me.emit('create', filePath, stats);
								if(stats.isFile())
									me.emit( 'createfile', filePath, stats);
								if(stats.isDirectory())
									me.emit( 'createdirectory', filePath, stats);
								me.watchTree(filePath);
							} else if(stats.isDirectory()){
								me.emit('change', filePath, stats);
								me.emit('changedirectory', filePath, stats);
							}
						} else if(event === 'change' && stats.isDirectory()) {
							me.emit('change', filePath, stats);
							me.emit('changedirectory', filePath, stats);
						}
					}
				});
			} else {
				//me.emit('delete', filePath);
				if( me.files[filePath] ){
					if(me.files[filePath].stat.isDirectory()){
						me.emit('delete', filePath, me.files[filePath].stat);
						me.emit('deletedirectory', filePath, me.files[filePath].stat);
						me.unwatchTree(filePath);
					}
				}
			}
		});
	});
};

/**
 * 监视方法
 * @param fspath    路径
 * @param fod       f or d，f-文件，d-目录
 * @param eOpts     scan-fs中的事件选项{path: '', stat: {}, parent: ''}
 * @private
 */
Watch.prototype.__watch =function(fspath, fod, eOpts){

	if(this.files[fspath])
		return ;

	this.files[fspath] = eOpts;
	var watcher;
	if(fod === 'f')
		watcher = this.__watchFile(fspath);
	else if( fod === 'd')
		watcher = this.__watchDirectory(fspath);
	else if(eOpts){
		if(eOpts.stat.isFile()){
			watcher = this.__watchFile(fspath);
		} else if(eOpts.stat.isDirectory()){
			watcher = this.__watchDirectory(fspath);
		}
	}

	this.files[fspath]['watcher'] = watcher;
};

/**
 * 添加listeners(create[createfile, createdirectory], delete[deletefile, deletedirectory], change[changefile, changedirectory])，格式
 * {
 *    create: function(){path, stat},
  *   deletefile: function(path, stat){},
  *   deletedirectory: function(path, stat){}
  *    ...
 * }
 * @param listeners
 * @returns {this}
 */
Watch.prototype.listeners = function(listeners) {
	var me = this;
	Object.keys(listeners ).forEach(function(key, idx, all){
		me.on(key, listeners[key]);
	});
	return this;
};

/**
 * 添加create事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onCreate = function(fn) {
	this.on('create', fn);
	return this;
};

/**
 * 添加createfile事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onCreateFile = function(fn) {
	this.on('createfile', fn);
	return this;
};

/**
 * 添加createdirectory事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onCreateDirectory = function(fn) {
	this.on('createdirectory', fn);
	return this;
};

/**
 * 添加delete事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onDelete = function(fn) {
	this.on('delete', fn);
	return this;
};

/**
 * 添加deletefile事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onDeleteFile = function(fn) {
	this.on('deletefile', fn);
	return this;
};

/**
 * 添加deletedirectory事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onDeleteDirectory = function(fn) {
	this.on('deletedirectory', fn);
	return this;
};

/**
 * 添加change事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onChange = function(fn) {
	this.on('change', fn);
	return this;
};

/**
 * 添加changefile事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onChangeFile = function(fn) {
	this.on('changefile', fn);
	return this;
};

/**
 * 添加changedirectory事件处理函数
 * @param fn
 * @returns {*}
 */
Watch.prototype.onChangeDirectory = function(fn) {
	this.on('changedirectory', fn);
	return this;
};

/**
 * 添加不需要监视文件或目录的规则，参数可以是正则表达式、字符串、方法当然也可以是它们组成的数组，格式如下：
 *      RegExp  正则表达式
 *      *dirname*   字符串
 *      function(path){return true;}方法
 *      []      数组
 * @param filter
 */
Watch.prototype.exclude = function(filter){
	this.scanFS.exclude(filter);
};

/**
 * 取消监视目录或文件
 * @param root  要取消监视的目录，通常为监视目录的子目录或文件
 */
Watch.prototype.unwatchTree = function(root){
	if(/\/$/.test(root))
		root = root.replace(/\/$/g, '');
	var me = this;

	Object.keys(me.files).forEach(function(item, idx, items){
		if(item.indexOf(root) === 0){
			if(me.files[item].stat.isDirectory()){
				if(me.files[item]['watcher'])
					me.files[item]['watcher'].close();
			} else if(me.files[item].stat.isFile()){
				if(me.files[item]['watcher'])
					fs.unwatchFile(item, me.files[item]['watcher']);
			}
			delete me.files[item];
		}
	});
};

/**
 * 监视文件目录树
 * @param root  要监视的跟路径
 * @param callback  回调函数，可得到3个参数，每次目录发生变化(新增、删除)时都会执行这个方法
 *  err 错误
 *  fileCount   监视文件的数量
 *  dirCount    监视目录的数量
 */
Watch.prototype.watchTree = function(root, callback){
	if(typeof callback === 'function')
		this.__scanCallback = callback;
	this.scanFS.scan(root);
};

/**
 * 获取Watch的ScanFS.
 * @returns {ScanFS}
 */
Watch.prototype.getScanFS = function(){
	return this.scanFS;
};

/**
 * 创建Watch
 * @paramer callback    回调函数，可选。回调函数将得到1个参数
 *      watch    新创建的Watch对象。
 * @returns {Watch}
 */
exports.create = function(callback){
	var watch = new Watch();

	if(typeof callback === 'function')
		callback(watch);

	return watch;
}