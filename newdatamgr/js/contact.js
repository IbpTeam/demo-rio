var Contact = Class.extend({
  init:function(){
    this._contacts = [];
    this._showList = [];
    this._ContactContainer = $('<div>',{
      'id': 'contact-container'
    })
    this._contactsList = $('<div>', {
      'id': 'contact-left',
      'class': 'nanoContact'
    });
    this._contactsListNano = $('<div>',{
      'class': 'nano-content'
    });
    this._ContactContainer.append(this._contactsList);
    this._contactsList.append(this._contactsListNano);
    this._contactHead = $('<div>', {
      'id': 'contact-head'
    });
    this._ContactContainer.append(this._contactHead);
    this._defaultPhoto = 'img/headphoto.svg';
    this._contactDetails = $('<div>', {
      'id': 'contact-detail',
      'class': 'contactDetail'
    });
    this._contactsDetailsNano = $('<div>',{
      'class': 'nano-content'
    });
    this._first = true;
    this._ContactContainer.append(this._contactDetails);
    this._contactDetails.append(this._contactsDetailsNano);
    this._tagView = TagView.create({
      category:'contact'
    });
    this._tagView.setParent(this._contactHead);
    this._selectId = 0;
    this.bindDrag(this._contactHead[0]);
    this.setContextMenu();
  },

  setContactsList:function(){
    var _this = this;
    DataAPI.getAllDataByCate(function(contact_json_){
      _this._contacts = contact_json_;
      if(_this._contacts != null && _this._contacts.length > 0){
        _this.loadContactsList(0);
      }
      infoList.searchTag(_params);
      _this._first = false;
    }, 'Contact');
  },

  loadContactsList:function(_index, showList){
    if(showList != null){
      this._showList = showList;
    } else {
      this._showList = this._contacts;
    }
    this.removeContactList();
    var family_name_json = {};
    for(var i = 0; i < this._showList.length; i ++){
      var family_name = this._showList[i]['name'][0];
      if(family_name_json.hasOwnProperty(family_name)){
        family_name_json[family_name].push({
          name: this._showList[i]['name'],
          id: i
        });
      } else {
        family_name_json[family_name] = [{
          name: this._showList[i]['name'],
          id: i
        }];
      }
    }
    for(var i in family_name_json){
      var _ul = $('<ul>', {
        'class':'ul-family'
      });
      var _first = $('<li>',{
        'class': 'ul-first',
        'text': i
      });
      _ul.append(_first);
      for(var j = 0; j < family_name_json[i].length; j ++){
        var _name = $('<li>', {
          'class':'li-name',
          'text': family_name_json[i][j]['name'],
          'id': family_name_json[i][j]['id']
        });
        _ul.append(_name);
      }
      this._contactsListNano.append(_ul);
    }
    this.removeHead();
    this.setHead(this._showList[_index]);
    this.removeDetails();
    this.setDetails(this._showList[_index]);
    this.bindAction();
    this.refreshListScroll();
  },

  bindAction: function(){
    var _this = this;
    $('.li-name').on('click', function(){
      _this.removeHead();
      _this.removeDetails();
      _this.setHead(_this._showList[this.id]);
      _this.setDetails(_this._showList[this.id], this.id);
      _this._selectId = this.id;
    });

    //forbid context menu
    $(document).on('contextmenu','#'+_this._contactsList[0].id, function(ev){
      ev.stopPropagation();
      ev.preventDefault();
    });
  },
  
  setContextMenu:function(){
    var _this = this;
    contextMenu.addCtxMenu([
      {header: 'contact menu'},
      {text:'标签', subMenu:[
        {text: '增加',action:function(){
          basic.addTagView(_this,_this._showList[_this._selectId]['URI'],'contact');
        }},
        {text: '删除', action:function(){
          basic.removeTagView(_this._contactHead,_this._showList[_this._selectId]['URI'],'contact');
        }}
      ]},
      {text: '删除联系人', action:function(){
        DataAPI.rmDataByUri(function(err, result){
          if(result == "success"){
            _this._showList.splice(_this._selectId, 1);
            _this.loadContactsList(0);
            infoList.setContent();
          }else{
            window.alert("Delete file failed!");
          }
        },_this._showList[_this._selectId]['URI']);
        DataAPI.rmDataByUri(function(err, result){
          if(result == "success"){
            _this._contacts.splice(_this._selectId, 1);
            _this.loadContactsList(0);
            infoList.setContent();
          }else{
            window.alert("Delete file failed!");
          }
        },_this._contacts[_this._selectId]['URI']);
        
      }},
      {text: '编辑联系人',action:function(){        
        _this.editDetails(_this._contacts[_this._selectId], _this._selectId);
      }}
    ]);
    contextMenu.attachToMenu('#contact-container',
      contextMenu.getMenuByHeader('contact menu'),
      function(){
        basic._tagDragged = _this._tagView; 
      });
  },

  setHead: function(contact_){
    var _headPhotoPath = '';
    if(contact_ && contact_['photoPath']){
      _headPhotoPath = contact_['photoPath'];
    } else{
      _headPhotoPath = this._defaultPhoto;
    }
    var _photoDiv = $('<div>', {
      'class' : 'div-headphoto'
    });
    var _photo = $('<img>', {
      'class': 'img',
      'src': _headPhotoPath
    });
    _photoDiv.append(_photo);

    var _uri = contact_? contact_['URI']:undefined;
    var _tags = [];
    var _tagStr = contact_ ? contact_['others']:undefined;
    if (typeof _tagStr === 'string' && _tagStr.length > 0) {
      _tags = _tagStr.split(',');
    };
    this._contactHead.append(_photoDiv);

    this._tagView.refresh();
    this._tagView.addTags(_tags);
    this._tagView.setUri(_uri);

    var _contactHeadBackBlue = $('<div>', {
      'id':'contact-back-blue'
    });
    this._contactHead.append(_contactHeadBackBlue);
    var _contactHeadBackRed = $('<div>', {
      'id':'contact-back-red'
    });
    this._contactHead.append(_contactHeadBackRed);
  },

  setDetails: function(contact_, id){
    var _this = this;
    var _nameDiv = $('<div>', {
      'class': 'div-name',
      'text': (contact_ ? contact_['name'] : 'none')
    });
    var _ul = $('<ul>', {
      'class':'ul-details'
    });
    var keys = ['name', 'phone', 'email', 'sex', 'age'];
    var keys_chs = ['姓名','电话','邮件','性别','年龄'];
    for(var key in contact_){
      var posinKeys = -1;
      for(var i =0; i < keys.length;i++){
        if(key == keys[i]){
          posinKeys = i;
          break;
        }
      }
      if(posinKeys == -1) continue;
      if(key == 'URI'||key == 'others') continue;
      var _li = $('<li>',{
        'class': 'li-details'
      });
      var _keyDiv = $('<div>', {
        'class': 'div-key',
        'text': keys_chs[posinKeys]
      });
      var _valueDiv = $('<div>', {
        'class': 'div-value',
        'text': contact_[key]
      });
      _li.append(_keyDiv);
      _li.append(_valueDiv);
      _ul.append(_li);
    }
    _this._contactsDetailsNano.append(_nameDiv);
    _this._contactsDetailsNano.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _addButton = $('<input>', {
      'type' : 'button',
      'id': 'add-button',
      'value': '添加'
    });
    _buttonsDiv.append(_addButton);
    var _editButton = $('<input>', {
      'type' : 'button',
      'id' : 'edit-button',
      'value' : '编辑'
    });
    _buttonsDiv.append(_editButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#add-button').on('click', function(){
      _this.addContact();
      _this._tagView.removeTags();
    });
    $('#edit-button').on('click', function(){
      _this.editDetails(contact_, id);
    });
    _this.refreshDetailScroll();
  },

  addContact: function(){    
    var _this = this;
    _this.removeDetails();
    var keys = ['name', 'phone', 'email', 'sex', 'age'];
	  var keys_chs = ['姓名','电话','邮件','性别','年龄'];
    var _ul = $('<ul>', {
      'class':'ul-details'
    });
    for(var i = 0; i < keys.length; i ++){
      var _li = $('<li>',{
        'class': 'li-details'
      });
      var _keyDiv = $('<div>', {
        'class': 'div-key',
        'text': keys_chs[i]
      });
      var _valueDiv = $('<div>', {
        'class': 'div-value',
      });
      var _editInput = $('<input>', {
        'class' : 'input-value',
        'id' : keys[i]
      });
      _valueDiv.append(_editInput);
      _li.append(_keyDiv);
      _li.append(_valueDiv);
      _ul.append(_li);
    }
    _this._contactsDetailsNano.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _confirmAddButton = $('<input>', {
      'type' : 'button',
      'id' : 'confirm-add-button',
      'value' : '添加'
    });
    _buttonsDiv.append(_confirmAddButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#confirm-add-button').on('click', function(){
      var _newContact = {};
      var _isValid = true;
      for(var i = 0; i < keys.length; i ++){
        var _newValue = document.getElementById(keys[i]).value;
        _newContact[keys[i]] = _newValue;
      }
      if(_newContact['email'] != '' && _newContact['email'].indexOf('@') == -1){
        _isValid = false;
        alert("Invalid Email!");
      }
      if(_newContact['phone'] != '' && isNaN(_newContact['phone'])){
        _isValid = false;
        alert("Invalid Phone Number!");
      }
      if(_newContact['name'] == ''){
        _isValid = false;
        alert("Name can not be null!");
      }
      if(_isValid == true){
        DataAPI.createFile(function(err_, result_){
          if(result_ == 'success'){
            _this._contacts.push(_newContact);
            _this.loadContactsList(_this._contacts.length - 1);
          } else {
            alert('Saved failed!');
          }
        }, _newContact, 'contact');
      }
    });
  },

  editDetails: function(contact_, id){
    var _this = this;
    _this.removeDetails();
    var _ul = $('<ul>', {
      'class':'ul-details'
    });
    var keys = ['name', 'phone', 'email', 'sex', 'age'];
    var keys_chs = ['姓名','电话','邮件','性别','年龄'];
    for(var key in contact_){
      var posinKeys = -1;
      for(var i =0; i < keys.length;i++){
        if(key == keys[i]){
          posinKeys = i;
          break;
        }
      }
      //if(posinKeys == -1) continue;
      if(key === 'URI' || key === 'others') continue;
      var _li = $('<li>',{
        'class': 'li-details'
      });
      var _keyDiv = $('<div>', {
        'class': 'div-key',
        'text': keys_chs[posinKeys]
      });
      var _valueDiv = $('<div>', {
        'class': 'div-value',
      });
      var _editInput = $('<input>', {
        'class' : 'input-value',
        'value' : contact_[key],
        'id' : key
      });
      _valueDiv.append(_editInput);
      _li.append(_keyDiv);
      _li.append(_valueDiv);
      _ul.append(_li);
    }
    _this._contactsDetailsNano.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _saveButton = $('<input>', {
      'type' : 'button',
      'id' : 'save-button',
      'value' : '保存'
    });
    _buttonsDiv.append(_saveButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#save-button').on('click', function(){
      var _newContact = {};
      for(var key in contact_){
        if(key == 'URI' || key == 'others') continue;
        var _newValue = document.getElementById(key).value;
        _newContact[key] = _newValue;
      }
      _newContact['category'] = 'contact';
      _newContact['URI'] = contact_['URI'];
      DataAPI.updateDataValue(function(result_){
        if(result_ == 'success'){
          _this.removeDetails();
          _this.setDetails(_newContact);
          _this._contacts[id] = _newContact;
        } else {
          alert('Saved failed!');
        }
      }, [_newContact]);
    });
  },
  openContract:function(contractString){
    this.loadContactsList(0);
    var _contacts = $('.li-name');
    for (var i = 0; i < _contacts.length; i++) {
      if(_contacts[i].textContent === contractString){
        _contacts[i].click();
        break;
      }
    };
  },

  removeHead: function(){
    var _list = this._contactHead.children();
    if(_list.length != 0){
      _list.remove();
    }
  },

  removeDetails: function(){
    var _list = this._contactsDetailsNano.children();
    if(_list.length != 0){
      _list.remove();
    }
    this._contactDetails.children('#buttons-div').remove();
  },

  removeContactList: function(){
    var _list = this._contactsListNano.children();
    if(_list.length != 0){
      _list.remove();
    }
  },

  attach:function($parent_){
    $parent_.append(this._ContactContainer);
  },

  hide:function(){
    this._ContactContainer.hide();
  },

  show:function(){
    this._ContactContainer.show();
    this.refreshListScroll();
    this.refreshDetailScroll();
  },

  refresh:function(){
    this._contactsListNano.children('ul').remove();
    this.setContactsList();
  },

  refreshListScroll:function(){
    this._contactsList.nanoScroller();
  },

  refreshDetailScroll:function(){
    this._contactDetails.nanoScroller();
  },

  bindDrag:function(target_){
    target_.ondragover = this.dragover;
    target_.ondrop = this.drop;
  },
  drop:function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    var _tag = ev.dataTransfer.getData('tag');
    var _category = ev.dataTransfer.getData('category');
    var _uri = ev.dataTransfer.getData('uri');
    if (typeof _tag === 'string' && _tag.length > 0) {
      DataAPI.setTagByUri(function(err_){
        if (err_ === null) {
          if(!contact._tagView.addTag(_tag)){
            return 0;
          }
          contact._contacts[contact._selectId]['others'] += ','+_tag;
          infoList.fixTagNum(_tag,1);
          var _tagedFile = [contact._contacts[contact._selectId]['URI']];
          if(infoList._info['tagFiles'].hasOwnProperty(_tag)){
            infoList._info['tagFiles'][_tag].push(_tagedFile);
          } else {
            infoList._info['tagFiles'][_tag] = [_tagedFile];
            infoList._info['tags'].push(_tag);
          }
        };
      },[_tag],contact._tagView._uri);
    }else if(_uri && _category === 'picture'){
      var _modalUri = basic.uriToModifyUri(_uri);
      var _file = basic.findFileByURI(_modalUri,_globalSelf._getFiles[1]);  //index = 1 is picture
      var _path = _file['path'];
      var _contactJson = contact._contacts[contact._selectId];
      _contactJson['photoPath'] = _path;
      _contactJson['category'] = 'contact';
      DataAPI.updateDataValue(function(result_){
        if(result_ == 'success'){
          contact._contacts[contact._selectId] = _contactJson;
          contact.removeHead();
          contact.setHead(_contactJson);
        }
      },[_contactJson]);
    }
  },
  dragover:function(ev){
    ev.preventDefault();  
  }
});
