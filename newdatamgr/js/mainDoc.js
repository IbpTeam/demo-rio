var MainDocView = Class.extend({
  init:function(){
    this._DocContainer = $('<div>',{
      'id': 'doc-container'
    })
    this._DocTitleContent = $('<div>',{
      'id': 'doc-title-content'
    });
    this._DocContent = $('<div>',{
      'id': 'doc-content'
    });
    this._DocContainer.append(this._DocTitleContent);
    this._DocContainer.append(this._DocContent);
    //input title ui
    this._DocTitleTag = $('<div>',{
      'id': 'doc-title-tag'
    })
    this._DocTitleContent.append(this._DocTitleTag);
    this._DocTitleText = $('<span>',{
      'id': 'doc-title-text',
      'text': 'Document'
    })
    this._DocTitleContent.append(this._DocTitleText);
    this._DocSelectDiv = $('<div>',{
      'id': 'doc-select-div'
    })
    this._DocTitleContent.append(this._DocSelectDiv);
    this._DocSelectWord = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox'
    })
    this._DocSelectDiv.append(this._DocSelectWord);
    this._DocSelectDiv.append('<span class="select-text">Word</span>');
    this._DocSelectExcel = $('<input>',{
      'class' : 'doc-select',
      'type': 'checkbox'
    });
    this._DocSelectDiv.append(this._DocSelectExcel);
    this._DocSelectDiv.append('<span class="select-text">Excel</span>');
    this._DocSelectPpt = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox'
    })
    this._DocSelectDiv.append(this._DocSelectPpt);
    this._DocSelectDiv.append('<span class="select-text">PowerPoint</span>');

    this.iconpath = {};
    this.setIcon();
    this.appendFile({
      'path': 'jsdkjfjslkaf',
      'type': 'Word',
      'name': 'test.word'
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
      'name': 'test.word'
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
    this._DocContent.append(_fileView);
  },
  attach:function($parent_){
    $parent_.append(this._DocContainer);
  }

});