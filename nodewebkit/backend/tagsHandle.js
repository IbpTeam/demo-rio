var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var os = require('os');
var config = require("./config");
var dataDes = require("./FilesHandle/desFilesHandle");
var commonDAO = require("./DAO/CommonDAO");
var resourceRepo = require("./FilesHandle/repo");
var device = require("./devices");
var util = require('util');
var events = require('events'); 
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");

function pickTags(oTag,rePos,path){
	if(path.length <= 2){
		return;
	}
	var sStartPart = path.slice(rePos,path.length);
	var startPos = sStartPart.indexOf('/');
	if(startPos == -1){
		return;
	}
	var sTag = sStartPart.substring(0,startPos);
	oTag.push(sTag);
	var sNewStart = sStartPart.slice(startPos+1,sStartPart.length);
	pickTags(oTag,0,sNewStart);
}

function getTagsByPath(path){
	var oTags = [];
	var regPos = path.search(/picture|photo|\u56fe|contact|music|document|video/i);
	if(regPos>-1){
		pickTags(oTags,regPos,path);
	}
	return oTags;
}
exports.getTagsByPath = getTagsByPath;

function getAllTagsByCategory(category,callback){
	var TagFile = {tags:[],tagFiles:{}};
	function findItemsCb(err,items){
		if(err){
			console.log(err);
			return;
		}
		for(var k in items){
			for(var j in items[k].others){
				if(TagFile.tagFiles.hasOwnProperty(items[k].others[j])){
					TagFile.tagFiles[items[k].others[j]].push([items[k].URI,items[k].filename]);
				}

			}


		}
		callback(tags);
	}
	commonDAO.findItems(['others','filename','uri'],[category],null,null,findItemsCb);
}
exports.getAllTagsByCategory = getAllTagsByCategory;

function getAllTags(callback){
	var TagFile = {};
	function findItemsCb(err,items){
		if(err){
			console.log(err);
			return;
		}
		for(var k in items){
			if(TagFile.hasOwnProperty(items[k].tag)){
				TagFile[items[k].tag].push(items[k].file_URI);
			}else{
				TagFile[items[k].tag] = [items[k].file_URI];
			}
			callback(TagFile);
		}
	}
	commonDAO.findItems(null,['tags'],null,null,findItemsCb)
}
exports.getAllTags = getAllTags;