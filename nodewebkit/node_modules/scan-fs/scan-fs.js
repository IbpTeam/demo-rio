/**
 *  扫描文件系统
 * User: lg
 * Date: 8/16/13
 * Time: 3:34 PM
 * Version: v0.0.1
 */

var fs = require('fs')
	, join = require('path' ).join
	, events = require('events' )
	, util = require('util');

ScanFS = function(){
	events.EventEmitter.call(this);

	this.dirCount = 0;
	this.fileCount = 0;
	this.__pending = 0;
	this.__recursive = true;
	this._exclusions = require('path-filters').create();
}

util.inherits(ScanFS, events.EventEmitter);

/**
 * 开始执行扫描
 * @param path  扫描路径
 * @param parent    父路径，不需要传
 */
ScanFS.prototype.scan = function(path, parent){

	if(this._exclusions.hasMatch(path)){
		if(this.__pending === 0)
			this.emit('complete', this.fileCount, this.dirCount);
		return ;
	}

	this.__pending++;

	var me = this;

	fs.stat(path, function(err, stat){
		me.__pending--;
		var eOpts = {
			path: path,
			stat: stat,
			parent: parent
		};

		if(err)
			me.emit('error', err);
		else{

			me.emit('path', path, eOpts);

			if(!parent)
				me.emit('root', path, eOpts);

			if(stat.isFile()){
				me.fileCount ++ ;
				me.emit('file', path, eOpts);
			} else if( stat.isDirectory()){

				if(parent){
					me.dirCount ++ ;
					me.emit('directory', path, eOpts);
				}
				if(me.__recursive || parent === undefined){
					me.__pending++;

					fs.readdir(path, function(err, fileNames){
						if(err)
							me.emit('error', err);
						else {
							me.__pending--;

							fileNames.forEach(function(fileName, idx, all){
								me.scan(join(path, fileName), path);
							});

							if(me.__pending === 0)
								me.emit('complete', me.fileCount, me.dirCount);

						}
					});
				}
			}
		}

		if(me.__pending === 0)
			me.emit('complete', me.fileCount, me.dirCount);
	});
};

/**
 * 添加不包含的规则，可以使用带*的字符串、正则表达式、方法等，详细参考path-filters
 * @param filter    过滤条件
 * @param recursive 递归
 * @returns ScanFS
 */
ScanFS.prototype.exclude = function(filter, recursive) {
	this._exclusions.add(filter, recursive);
	return this;
};

/**
 * 得到path-filters
 * @returns PathFilters
 */
ScanFS.prototype.getExclusions = function() {
	return this._exclusions;
};

/**
 * 注册扫描到跟目录时的处理事件
 * @param callback  事件处理函数
 * @returns ScanFS
 */
ScanFS.prototype.onRoot = function(callback) {
	this.on('root', callback);
	return this;
};

/**
 * 注册扫描到每个路径时的处理事件
 * @param callback  事件处理函数
 * @returns ScanFS
 */
ScanFS.prototype.onPath = function(callback) {
	this.on('path', callback);
	return this;
};

/**
 * 注册扫描到文件时的处理事件
 * @param callback  事件处理函数
 * @returns ScanFS
 */
ScanFS.prototype.onFile = function(callback) {
	this.on('file', callback);
	return this;
};

/**
 * 注册扫描到目录时的处理事件
 * @param callback  事件处理函数
 * @returns ScanFS
 */
ScanFS.prototype.onDirectory = function(callback) {
	this.on('directory', callback);
	return this;
};

/**
 * 注册错误处理事件
 * @param callback  事件处理函数
 * @returns ScanFS
 */
ScanFS.prototype.onError = function(callback) {
	this.on('error', callback);
	return this;
};

/**
 * 注册扫描完成时的处理事件
 * @param callback  事件处理函数
 * @returns ScanFS
 */
ScanFS.prototype.onComplete = function(callback) {
	this.on('complete', callback);
	return this;
};

/**
 * 设置是否递归子目录
 * @param recursive  布尔值，true-递归子目录；false-不递归子目录
 * @returns ScanFS
 */
ScanFS.prototype.setRecursive = function(recursive) {
	this.__recursive = recursive;
	return this;
};

/**
 * 添加listeners(root, path, file, directory,error,complete)，格式
 * {
 *    root: function(){},
  *    path: function(){},
  *    ...
 * }
 * @param listeners
 * @returns {*}
 */
ScanFS.prototype.listeners = function(listeners) {
	var me = this;
	Object.keys(listeners ).forEach(function(key, idx, all){
		me.on(key, listeners[key]);
	});
	return this;
};

/**
 * 创建扫描文件系统的对象。
 * @returns {ScanFS}
 */
exports.create = function(){
	return new ScanFS();
}
