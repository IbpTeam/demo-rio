var UsrInfoView = Class.extend({
  init:function(){
  	this._usrInfoContainer = $('<div>',{
  	  'id' : 'usrInfo-container'
  	});
    this._closeDiv = $('<div>',{
      'id' : 'closeDiv'
    });
    this._usrInfoDiv = $('<div>',{
      'id' : 'usrInfoDiv'
    });
    this._usrExtraDiv = $('<div>',{
      'id' : 'usrExtraDiv'
    });
    this._defaultHeadPhoto = 'img/headphoto.png';
    this._usrInfoContainer.append(this._closeDiv);
    this._usrInfoContainer.append(this._usrInfoDiv);
    this._usrInfoContainer.append(this._usrExtraDiv);
    this._modalBox = undefined;
    //this.setUsrInfo();
    //this.setUsrExtra('load');
  },
  setUsrInfo:function(){
    var _headPhotoSrc = '';
    var _tempName = 'Rio';
    var _tmpIp = '192.168.162.7';
    var _tmpDevices = 'deviceId';
    var _tmpOthers = 'this is others';
    if(true)
      _headPhotoSrc = this._defaultHeadPhoto;
    var _usrHeadShow = $('<div>',{
      'id' : 'usrHeadShow'
    });
    var _usrInfoShow = $('<div>',{
      'id' : 'usrInfoShow'
    });
    var _usrPhotoDiv = $('<div>',{
      'id' : 'usrPhotoDiv'
    });
    var _usrEditDiv = $('<div>',{
      'id' : 'usrEditDiv',
      'text' : 'Change'
    });
    var _headPhotoImg = $('<img>',{
      'id' : 'headPhotoImg',
      'src' : _headPhotoSrc
    });
    var _usrInfoUl = $('<ul>',{
      'id' : 'usrInfoUl'
    });
    var _usrName = $('<li>',{
      'class' : 'usrInfo-ul',
      'text' : 'Name: ' + _tempName
    });
    var _usrIp = $('<li>',{
      'class' : 'usrInfo-ul',
      'text' : 'IP: ' + _tmpIp
    });
    var _usrDevices = $('<li>',{
      'class' : 'usrInfo-ul',
      'text' : 'Devices: ' + _tmpDevices
    });
    var _usrOthers = $('<li>',{
      'class' : 'usrInfo-ul',
      'text' : 'Others: ' + _tmpOthers
    });
    _usrInfoUl.append(_usrName);
    _usrInfoUl.append(_usrIp);
    _usrInfoUl.append(_usrDevices);
    _usrInfoUl.append(_usrOthers);
    _usrInfoShow.append(_usrInfoUl);
    _usrPhotoDiv.append(_headPhotoImg);
    _usrHeadShow.append(_usrPhotoDiv);
    _usrHeadShow.append(_usrEditDiv);
    this._usrInfoDiv.append(_usrHeadShow);
    this._usrInfoDiv.append(_usrInfoShow);

  },
  setUsrExtra:function(extraAction_){
    switch(extraAction_){
      case 'load' : {
        this.setExtraLoad();
      }
      break;
      default : {

      }
    }
  },
  setExtraLoad:function(){
    var _extraLoadDiv = $('<div>',{
      'id' : 'extraLoadDiv'
    });

    var _loadContactBg = $('<div>',{
      'id' : 'loadContactBg'
    });
    var _loadContactDiv = $('<div>',{
      'id' : 'loadContactDiv'
    });
    var _contactLabel = $('<label>',{
      'id' : 'contactLabel',
      'text' : 'Contacts'
    });
    var _contactCheckBox = $('<input>',{
      'id' : 'contactCheckBox',
      'type' : 'checkbox',
      'checked' : 'checked',
      'click' : function(){
        $('#dataCheckBox')[0].checked = false;
      }
    });
    _loadContactDiv.append(_contactCheckBox);
    _loadContactDiv.append(_contactLabel);
    _loadContactBg.append(_loadContactDiv);

    var _loadDataBg = $('<div>',{
      'id' : 'loadDataBg'
    });
    var _loadDataDiv = $('<div>',{
      'id' : 'loadDataDiv'
    });
    var _dataLabel = $('<label>',{
      'id' : 'dataLabel',
      'text' : 'Data'
    });
    var _dataCheckBox = $('<input>',{
      'id' : 'dataCheckBox',
      'type' : 'checkbox',
      'click' : function(){
        $('#contactCheckBox')[0].checked = false;
      }
    });
    _loadDataDiv.append(_dataCheckBox);
    _loadDataDiv.append(_dataLabel);
    _loadDataBg.append(_loadDataDiv);

    var _uploadDiv = $('<div>',{
      'id' : 'uploadDiv'
    });
    var _fileUpLoad = $('<input>',{
      'id' : 'fileUpLoad',
      'type' : 'file',
      'nwdirectory' : 'true',
      'change' : function(){
        var resourcePath = this.value;
        if ($('#contactCheckBox')[0].checked) {
          DataAPI.loadContacts(function(result){
            alert(result);
          },resourcePath);
        }else if ($('#dataCheckBox')[0].checked) {
          DataAPI.loadResources(function(result){
            alert(result);
          },resourcePath);
        }else{
          //ToDo-err handle
        }
      }
    });
    _uploadDiv.append(_fileUpLoad);

    _extraLoadDiv.append(_loadContactBg);
    _extraLoadDiv.append(_loadDataBg);
    _extraLoadDiv.append(_uploadDiv);
    this._usrExtraDiv.append(_extraLoadDiv);
  },
  showUsrInfo:function(){
    this._modalBox = ModalBox.create($('#usrInfo-container'),{
      iconClose: false,                
      keyClose:true,                      
      bodyClose:true                    
    });
    var _modalBoxObj = this._modalBox;
    this._closeDiv.on('click',function(){
      _modalBoxObj.close();
    });
  },
  closeUsrInfo:function(){
    this._modalBox.close();
  },
  attach:function($parent_){
    $parent_.append(this._usrInfoContainer);
  },
  hide:function(){
    this._usrInfoContainer.hide();
  },
  show:function(){
    this._usrInfoContainer.show();
  }
});