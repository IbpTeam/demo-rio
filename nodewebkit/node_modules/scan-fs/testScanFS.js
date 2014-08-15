#!/usr/bin/env node

/**
 *
 * User: lg
 * Date: 8/16/13
 * Time: 11:47 PM
 * Version: v0.0.1
 */
var scanFS = require('scan-fs' ).create()
	, scanPath = process.argv.slice(2);

if(scanPath && scanPath.length > 0){

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
	}).setRecursive(true).scan(scanPath[0]);
} else {
	console.log('Usage:	node testScanFS.js path');
}
