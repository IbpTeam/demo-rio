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
      'text': 'Documents'
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
      'id':'checkbox-1'
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
      'id':'checkbox-2'
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
      'id':'checkbox-3'
    })
    this._docSelectDiv.append(this._docSelectPpt);
    this._docSelectPptLabel = $('<label>',{
      'for':'checkbox-3'
    })
    this._docSelectDiv.append(this._docSelectPptLabel);
    this._docSelectDiv.append('<span class="select-text">PowerPoint</span>');

    this.iconpath = {};
    this.setIcon();
    this.appendFile({
      'path': 'jsdkjfjslkaf',
      'type': 'Word',
      'name': '测试用的word，送的佛教课jk.word'
    })
    this.appendFile({
      'path': 'sdfsdafsdf',
      'type': 'Excel',
      'name': 'test.Excel'
    })
    this.appendFile({
      'path': 'jsdkjfjslkaf',
      'type': 'Powerpoint',
      'name': '123446546985092hjsadhjkdf.ppt'
    })
    this.appendFile({
      'path': 'jsdkjfjslkaf',
      'type': 'Word',
      'name': 'fsadfsa.word'
    })
    this.appendFile({
      'path': 'sdfsdafsdf',
      'type': 'Excel',
      'name': 'tesddsfasdf st.Excel'
    })
    this.appendFile({
      'path': 'jsdkjfjslkaf',
      'type': 'Powerpoint',
      'name': '123446 546985092 hjsadhjkdf.ppt'
    })
  },
  setIcon:function(){
    this.iconpath['Word'] = 'img/word.png';
    this.iconpath['Excel'] = 'img/excel.png';
    this.iconpath['Powerpoint'] = 'img/powerpoint.png';
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
  }

});
