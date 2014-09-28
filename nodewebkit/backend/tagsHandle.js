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
		return ;
	}
	var sStartPart = path.slice(rePos,path.length);
	var startPos = sStartPart.indexOf('/');
	if(startPos == -1){
		return;
	}
	var sTag = sStartPart.substring(0,startPos);
	//console.log("******************my tag: "+sTag);
	oTag.push(sTag);
	var sNewStart = sStartPart.slice(startPos+1,sStartPart.length);
	pickTags(oTag,0,sNewStart);
}



function getTagsByPath(path){
	var oTags = [];
	var reContacts = path.search(/contact/i);
	var reMusic = path.search(/music/i);
	var reDocuments = path.search(/document/i);
	var rePictures = path.search(/picture|photo|\u56fe/);
	var reVideos = path.search(/video/i);
	if(reContacts>-1){
		pickTags(oTags,reContacts,path);
	}
	if(reMusic>-1){
		pickTags(oTags,reMusic,path);
	}
	if(rePictures>-1){
		pickTags(oTags,rePictures,path);
	}
	if(reDocuments>-1){
		pickTags(oTags,reDocuments,path);
	}
	if(reVideos>-1){
		pickTags(oTags,reVideos,path);
	}
	return oTags;
}
exports.getTagsByPath = getTagsByPath;