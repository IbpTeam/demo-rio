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
      'text': 'document'
    })
    this._docTitleContent.append(this._docTitleText);
    this._docSelectDiv = $('<div>',{
      'id': 'doc-select-div'
    })
    this._docTitleContent.append(this._docSelectDiv);
    this._docSelectWord = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox'
    })
    this._docSelectDiv.append(this._docSelectWord);
    this._docSelectDiv.append('<span class="select-text">Word</span>');
    this._docSelectExcel = $('<input>',{
      'class' : 'doc-select',
      'type': 'checkbox'
    });
    this._docSelectDiv.append(this._docSelectExcel);
    this._docSelectDiv.append('<span class="select-text">Excel</span>');
    this._docSelectPpt = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox'
    })
    this._docSelectDiv.append(this._docSelectPpt);
    this._docSelectDiv.append('<span class="select-text">PowerPoint</span>');

    this.iconpath = {};
    this.setIcon();
    var _this = this;
    DataAPI.getRecentAccessData(function(err_, document_json_){
      for(var i = 0; i < document_json_.length; i++){
        _this.appendFile({
          'path': document_json_[i]['path'],
          'type': _this.getType(document_json_[i]['postfix']),
          'name': document_json_[i]['filename'] + document_json_[i]['postfix']
        });
      }
    }, 'document', 30);
  },
  setIcon:function(){
    this.iconpath['Word'] = 'img/word.png';
    this.iconpath['Excel'] = 'img/excel.png';
    this.iconpath['Powerpoint'] = 'img/powerpoint.png';
    this.iconpath['PDF'] = 'img/pdf.png';
    this.iconpath['Text'] = 'img/text.png';
    this.iconpath['default'] = 'img/default.png';
  },
  appendFile:function(file_){
    var _fileView = $('<div>',{
      'class': 'doc-icon',
      'data-path': file_.path
    });
    _fileView.html('<img draggable="false" src='
      + this.iconpath[file_.type]+' /><P>' + file_.name + '</P>');
    this._docContent.append(_fileView);
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
  }
});
