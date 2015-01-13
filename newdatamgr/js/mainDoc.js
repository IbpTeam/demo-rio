var MainDocView = Class.extend({
  init:function(){
    this._docContainer = $('<div>',{
      'id': 'doc-container'
    })
    this._docTitleContent = $('<div>',{
      'id': 'doc-title-content'
    });
    this._docContent = $('<div>',{
      'id': 'doc-content'
    });
    this._docContainer.append(this._docTitleContent);
    this._docContainer.append(this._docContent);
    //input title ui
    this._docTitleTag = $('<div>',{
      'id': 'doc-title-tag'
    })
    this._docTitleContent.append(this._docTitleTag);
    this._docTitleText = $('<span>',{
      'id': 'doc-title-text',
      'text': '文档'
    })
    this._docTitleContent.append(this._docTitleText);
    this._docSelectDiv = $('<div>',{
      'id': 'doc-select-div'
    })
    this._docTitleContent.append(this._docSelectDiv);
    this._docSelectWord = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox',
      'class': 'regular-checkbox',
      'id':'checkbox-1',
      'checked': 'checked'

    })
    this._docSelectDiv.append(this._docSelectWord);
    this._docSelectWordLabel = $('<label>',{
      'for':'checkbox-1'
    })
    this._docSelectDiv.append(this._docSelectWordLabel);
    this._docSelectDiv.append('<span class="select-text">Word</span>');
    this._docSelectExcel = $('<input>',{
      'class' : 'doc-select',
      'type': 'checkbox',
      'class': 'regular-checkbox',
      'id':'checkbox-2',
      'checked': 'checked'
    });
    this._docSelectDiv.append(this._docSelectExcel);
    this._docSelectExcelLabel = $('<label>',{
      'for':'checkbox-2'
    })
    this._docSelectDiv.append(this._docSelectExcelLabel);
    this._docSelectDiv.append('<span class="select-text">Excel</span>');
    this._docSelectPpt = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox',
      'class': 'regular-checkbox',
      'id':'checkbox-3',
      'checked': 'checked'
    })
    this._docSelectDiv.append(this._docSelectPpt);
    this._docSelectPptLabel = $('<label>',{
      'for':'checkbox-3'
    })
    this._docSelectDiv.append(this._docSelectPptLabel);
    this._docSelectDiv.append('<span class="select-text">PowerPoint</span>');

    this.iconpath = {};
    this.setIcon();
    var _this = this;
    DataAPI.getRecentAccessData(function(err_, document_json_){
      if(document_json_.length === 0){
        homePage._noneData++;
        if (homePage._noneData === homePage._dataClasses) {
          $('#avatar')[0].click();
        };
      }
      for(var i = 0; i < document_json_.length; i++){
        _this.appendFile({
          'URI': document_json_[i]['URI'],
          'type': _this.getType(document_json_[i]['postfix']),
          'postfix':document_json_[i]['postfix'],
          'name': document_json_[i]['filename'] + document_json_[i]['postfix'],
          'path': document_json_[i]['path']
        });
      }
    }, 'document', 30);
  },

  setIcon:function(){
    this.iconpath['Word'] = 'icons/word.png';
    this.iconpath['Excel'] = 'icons/excel.png';
    this.iconpath['Powerpoint'] = 'icons/powerpoint.png';
    this.iconpath['PDF'] = 'icons/pdf.png';
    this.iconpath['Text'] = 'icons/text.png';
    this.iconpath['default'] = 'icons/none.png';
  },

  removeFile:function(uri_){
    var _files = this._docContent.children('.doc-icon');
    for (var i = 0; i < _files.length; i++) {
      if($(_files[i]).data('uri') === uri_){
        $(_files[i]).remove();
        return 1;
      }
    };
    return 0;
  },

  appendFile:function(file_){
    var _fileView = $('<div>',{
      'class': 'doc-icon',
      'id':JSON.stringify(file_),
      'draggable': true
    });
    _fileView.data('uri',file_.uri);
    _fileView.html('<img draggable="false" src='
      + this.iconpath[file_.type]+' /><P title='+file_.name.replace(/ /g,'')+'>' + file_.name + '</P>');
    _fileView.dblclick(function(event) {
      basic.openFile(file_);
    });
    this._docContent.append(_fileView);
    this.bindDrag(_fileView[0]);
  },

  attach:function($parent_){
    $parent_.append(this._docContainer);
  },

  hide:function(){
    this._docContainer.hide();
  },

  show:function(){
    this._docContainer.show();
  },

  getType:function(postfix_){
    if(postfix_ == 'ppt' || postfix_ == 'pptx'){
      return 'Powerpoint';
    } else if(postfix_ == 'xls' || postfix_ == 'xlsx' || postfix_ == 'et' || postfix_ == 'ods'){
      return 'Excel';
    } else if(postfix_ == 'doc' || postfix_ == 'docx' || postfix_ == 'wps'){
      return 'Word';
    } else if(postfix_ == 'pdf'){
      return 'PDF';
    } else if(postfix_ == 'txt' || postfix_ == ''){
      return 'Text';
    } else {
      return 'default';
    }
  },

  bindDrag:function(file_){
    var _this = this;
    file_.ondragstart = function(ev){
      ev.dataTransfer.setData('uri',$(ev.currentTarget).data('uri'));
      ev.dataTransfer.setData('category','mainDoc');
    }
  },

  doubleClickEvent:function(jQueryElement,whichClass){
    //一个JQuery元素代表的是一系列文件
    this.files = jQueryElement;
    var _this = this;
    //绑定双击事件
    this.files.delegate(whichClass,'dblclick',function(e){
      file=JSON.parse(this.id)
      console.log(file.uri);
      basic.openFile(file);
      console.log("dblclick!");
    });
  }
});
