var dataAPI = require('../implements/data.js');
// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.data",
  "path": "/nodejs/webde/data",
  "name": "nodejs.webde.data",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "getLocalData",
      "in": [],
      "show": "l"
    },
    {
      "name": "startIMChatServer",
      "in": [],
      "show": "l"
    },
    {
      "name": "sendIMMsg",
      "in": [],
      "show": "l"
    },
    {
      "name": "loadFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "loadResources",
      "in": [],
      "show": "l"
    },
    {
      "name": "loadContacts",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllCate",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllDataByCate",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllContacts",
      "in": [],
      "show": "l"
    },
    {
      "name": "rmDataByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "getDataByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "getDataByPath",
      "in": [],
      "show": "l"
    },
    {
      "name": "openDataByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "openDataByPath",
      "in": [],
      "show": "l"
    },
    {
      "name": "updateDataValue",
      "in": [],
      "show": "l"
    },
    {
      "name": "getRecentAccessData",
      "in": [],
      "show": "l"
    },
    {
      "name": "getServerAddress",
      "in": [],
      "show": "l"
    },
    {
      "name": "getDeviceDiscoveryService",
      "in": [],
      "show": "l"
    },
    {
      "name": "pasteFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "createFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "getResourceDataDir",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllTagsByCategory",
      "in": [],
      "show": "l"
    },
    {
      "name": "getTagsByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "getTagsByUris",
      "in": [],
      "show": "l"
    },
    {
      "name": "setTagByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "setTagByUriMulti",
      "in": [],
      "show": "l"
    },
    {
      "name": "getFilesByTags",
      "in": [],
      "show": "l"
    },
    {
      "name": "getFilesByTagsInCategory",
      "in": [],
      "show": "l"
    },
    {
      "name": "rmTagsAll",
      "in": [],
      "show": "l"
    },
    {
      "name": "rmTagsByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "initDesktop",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllDesktopFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "readDesktopConfig",
      "in": [],
      "show": "l"
    },
    {
      "name": "writeDesktopConfig",
      "in": [],
      "show": "l"
    },
    {
      "name": "shellExec",
      "in": [],
      "show": "l"
    },
    {
      "name": "moveFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "renameDesktopFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "linkAppToDesktop",
      "in": [],
      "show": "l"
    },
    {
      "name": "unlinkApp",
      "in": [],
      "show": "l"
    },
    {
      "name": "moveToDesktopSingle",
      "in": [],
      "show": "l"
    },
    {
      "name": "moveToDesktop",
      "in": [],
      "show": "l"
    },
    {
      "name": "removeFileFromDB",
      "in": [],
      "show": "l"
    },
    {
      "name": "removeFileFromDesk",
      "in": [],
      "show": "l"
    },
    {
      "name": "getFilesFromDesk",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllVideo",
      "in": [],
      "show": "l"
    },
    {
      "name": "getAllMusic",
      "in": [],
      "show": "l"
    },
    {
      "name": "createFileOnDesk",
      "in": [],
      "show": "l"
    },
    {
      "name": "renameFileOnDesk",
      "in": [],
      "show": "l"
    },
    {
      "name": "getIconPath",
      "in": [],
      "show": "l"
    },
    {
      "name": "setRelativeTagByPath",
      "in": [],
      "show": "l"
    },
    {
      "name": "pullFromOtherRepoTest",
      "in": [],
      "show": "l"
    },
    {
      "name": "getGitLog",
      "in": [],
      "show": "l"
    },
    {
      "name": "repoReset",
      "in": [],
      "show": "l"
    },
    {
      "name": "repoResetFile",
      "in": [],
      "show": "l"
    },
    {
      "name": "renameDataByUri",
      "in": [],
      "show": "l"
    },
    {
      "name": "deviceInfo",
      "in": [],
      "show": "l"
    },
    {
      "name": "getMusicPicData",
      "in": [],
      "show": "l"
    },
    {
      "name": "getVideoThumbnail",
      "in": [],
      "show": "l"
    },
    {
      "name": "repoSearch",
      "in": [],
      "show": "l"
    }
  ],
  "serviceObj": {
    getLocalData: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    startIMChatServer: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    sendIMMsg: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    loadFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    loadResources: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    loadContacts: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllCate: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllDataByCate: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllContacts: function(callback) {
      dataAPI.getAllContacts(function(res){
        var retObj = new Object();
        retObj.ret = res;
        callback(retObj);
      });
    },
    rmDataByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getDataByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getDataByPath: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    openDataByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    openDataByPath: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    updateDataValue: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getRecentAccessData: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getServerAddress: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getDeviceDiscoveryService: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    pasteFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    createFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getResourceDataDir: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllTagsByCategory: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getTagsByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getTagsByUris: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    setTagByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    setTagByUriMulti: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getFilesByTags: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getFilesByTagsInCategory: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    rmTagsAll: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    rmTagsByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    initDesktop: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllDesktopFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    readDesktopConfig: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    writeDesktopConfig: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    shellExec: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    moveFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    renameDesktopFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    linkAppToDesktop: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    unlinkApp: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    moveToDesktopSingle: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    moveToDesktop: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    removeFileFromDB: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    removeFileFromDesk: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getFilesFromDesk: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllVideo: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getAllMusic: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    createFileOnDesk: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    renameFileOnDesk: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getIconPath: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    setRelativeTagByPath: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    pullFromOtherRepoTest: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getGitLog: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    repoReset: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    repoResetFile: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    renameDataByUri: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    deviceInfo: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getMusicPicData: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getVideoThumbnail: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    repoSearch: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/}
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('../../../webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null;
exports.getStub = function() {
  if(stub == null) {
    stub = new Stub();
  }
  return stub;
}
