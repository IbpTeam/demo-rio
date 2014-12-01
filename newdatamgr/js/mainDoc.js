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
		this._DocTitleText = $('<p>',{
			'id': 'doc-title-text'
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
		this._DocSelectDiv.append('<p class="select-text">Word</p>');
		this._DocSelectExcel = $('<input>',{
			'class' : 'doc-select',
			'type': 'checkbox'
		});
		this._DocSelectDiv.append(this._DocSelectExcel);
		this._DocSelectDiv.append('<p class="select-text">Excel</p>');
		this._DocSelectPpt = $('<input>',{
			'class': 'doc-select',
			'type': 'checkbox'
		})
		this._DocSelectDiv.append(this._DocSelectPpt);
		this._DocSelectDiv.append('<p class="select-text">PowerPoint</p>');

		this.iconpath = {};
		this.setIcon();
		this.appendFile({
			'path': 'jsdkjfjslkaf',
			'type': 'Word',
			'name': 'test.word'
		})
	},
	setIcon:function(){
		this.iconpath['Word'] = './img/Word.png';
		this.iconpath['Excel'] = './img/Excel.png';
		this.iconpath['PowerPoint'] = './img/PowerPoint';
	},
	appendFile:function(file_){
		var _fileView = $('<div>',{
			'class': 'doc-icon',
			'data-path': file_.path;
		});
		_fileView.html('<img draggable="false" src='
			+ this.iconpath[file_.type]+'/><P>' + file_.name + '</P>');
	},
	attach:function($parent_){
		$parent_.append(this._DocContainer);
	}


});