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
    this.iconpath['Word'] = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNC4yLDE1LjdjLTEsMC0xLjgtMC44LTEuOC0xLjhWMi4xYzAtMSwwLjgtMS44LDEuOC0xLjhIMTFsMywzVjE0YzAsMS0wLjgsMS44LTEuOCwxLjhoLThWMTUuN3oiLz4NCgkJPHBhdGggZmlsbD0iIzAwQUZEOCIgZD0iTTEwLjksMC40bDIuOSwyLjl2MTAuNmMwLDAuOS0wLjcsMS43LTEuNywxLjdINC4yYy0wLjksMC0xLjctMC43LTEuNy0xLjdWMi4xYzAtMC45LDAuNy0xLjcsMS43LTEuNw0KCQkJTDEwLjksMC40IE0xMSwwLjFINC4yYy0xLjEsMC0yLDAuOS0yLDJ2MTEuOGMwLDEuMSwwLjksMiwyLDJoNy45YzEuMSwwLDItMC45LDItMlYzLjJMMTEsMC4xTDExLDAuMXoiLz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iIzAwQUZEOCIgZD0iTTE0LjEsMy4yYy0wLjgsMC0yLDAuMS0yLjYtMC41QzEwLjksMi4yLDExLDEsMTEsMC4xTDE0LjEsMy4yeiIvPg0KCTxyZWN0IHg9IjEuMiIgeT0iMS42IiBmaWxsPSIjMDBBRkQ4IiB3aWR0aD0iOC40IiBoZWlnaHQ9IjcuMSIvPg0KCTxnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgICAgIj4NCgkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTMuMyw3LjdMMi4xLDIuNmgxLjJsMC40LDIuMUMzLjgsNS4zLDMuOSw2LDQsNi41aDBjMC4xLTAuNiwwLjItMS4yLDAuMy0xLjhsMC40LTIuMUg2bDAuNCwyLjINCgkJCWMwLjEsMC42LDAuMiwxLjIsMC4zLDEuN2gwQzYuOCw1LjksNi45LDUuMyw3LDQuN2wwLjQtMi4xaDEuMkw3LjMsNy43SDYuMUw1LjYsNS41QzUuNSw1LDUuNCw0LjUsNS40LDMuOWgwDQoJCQlDNS4zLDQuNSw1LjIsNSw1LjEsNS41TDQuNiw3LjdIMy4zeiIvPg0KCTwvZz4NCgk8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI0LjEiIHkxPSIxMS4xIiB4Mj0iMTIuMSIgeTI9IjExLjEiLz4NCgk8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI0LjEiIHkxPSIxMi40IiB4Mj0iMTIuMSIgeTI9IjEyLjQiLz4NCgk8bGluZSBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI0LjEiIHkxPSIxMy44IiB4Mj0iMTIuMSIgeTI9IjEzLjgiLz4NCjwvZz4NCjwvc3ZnPg0K';
    this.iconpath['Excel'] = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNC4yLDE1LjdjLTEsMC0xLjgtMC44LTEuOC0xLjhWMi4xYzAtMSwwLjgtMS44LDEuOC0xLjhIMTFsMywzVjE0YzAsMS0wLjgsMS44LTEuOCwxLjhoLThWMTUuN3oiLz4NCgkJPHBhdGggZmlsbD0iIzI2QUE1QiIgZD0iTTEwLjksMC40bDIuOSwyLjl2MTAuNmMwLDAuOS0wLjcsMS43LTEuNywxLjdINC4yYy0wLjksMC0xLjctMC43LTEuNy0xLjdWMi4xYzAtMC45LDAuNy0xLjcsMS43LTEuNw0KCQkJTDEwLjksMC40IE0xMSwwLjFINC4yYy0xLjEsMC0yLDAuOS0yLDJ2MTEuOGMwLDEuMSwwLjksMiwyLDJoNy45YzEuMSwwLDItMC45LDItMlYzLjJMMTEsMC4xTDExLDAuMXoiLz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iIzI2QUE1QiIgZD0iTTE0LjEsMy4yYy0wLjgsMC0yLDAuMS0yLjYtMC41QzEwLjksMi4yLDExLDEsMTEsMC4xTDE0LjEsMy4yeiIvPg0KCTxyZWN0IHg9IjEuMiIgeT0iMS42IiBmaWxsPSIjMjZBQTVCIiB3aWR0aD0iOC40IiBoZWlnaHQ9IjcuMSIvPg0KCTxnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgICAgIj4NCgkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTYuNSw3LjdMNS45LDYuOEM1LjYsNi40LDUuNCw2LjIsNS4yLDUuOWgwQzUuMSw2LjIsNC45LDYuNCw0LjcsNi44TDQuMSw3LjdIMi4ybDIuMS0yLjZsLTItMi41aDEuOQ0KCQkJbDAuNiwwLjlDNSwzLjgsNS4xLDQuMSw1LjMsNC40aDBDNS41LDQsNS42LDMuOCw1LjgsMy41bDAuNi0wLjloMS44bC0yLDIuNWwyLjEsMi42SDYuNXoiLz4NCgk8L2c+DQoJPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjAuMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNC4xIiB5MT0iMTIuNCIgeDI9IjEyLjEiIHkyPSIxMi40Ii8+DQoJPHJlY3QgeD0iNC4xIiB5PSIxMS4xIiBmaWxsPSJub25lIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHdpZHRoPSI4IiBoZWlnaHQ9IjIuNiIvPg0KPC9nPg0KPC9zdmc+DQo=';
    this.iconpath['Powerpoint'] = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNC4yLDE1LjdjLTEsMC0xLjgtMC44LTEuOC0xLjhWMi4xYzAtMSwwLjgtMS44LDEuOC0xLjhoNi44bDMsM3YxMC43YzAsMS0wLjgsMS44LTEuOCwxLjhINC4yeiIvPg0KCQk8cGF0aCBmaWxsPSIjRDE3NzAwIiBkPSJNMTAuOSwwLjRsMi45LDIuOXYxMC42YzAsMC45LTAuNywxLjctMS43LDEuN0g0LjJjLTAuOSwwLTEuNy0wLjctMS43LTEuN1YyLjFjMC0wLjksMC43LTEuNywxLjctMS43SDEwLjkNCgkJCSBNMTEsMC4xSDQuMmMtMS4xLDAtMiwwLjktMiwydjExLjhjMCwxLjEsMC45LDIsMiwyaDcuOWMxLjEsMCwyLTAuOSwyLTJWMy4yTDExLDAuMUwxMSwwLjF6Ii8+DQoJPC9nPg0KCTxwYXRoIGZpbGw9IiNEMTc3MDAiIGQ9Ik0xNC4xLDMuMmMtMC44LDAtMiwwLjEtMi42LTAuNUMxMC45LDIuMiwxMSwxLDExLDAuMUwxNC4xLDMuMnoiLz4NCgk8cmVjdCB4PSIxLjIiIHk9IjEuNiIgZmlsbD0iI0QxNzcwMCIgd2lkdGg9IjguNCIgaGVpZ2h0PSI3LjEiLz4NCgk8bGluZSBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI0LjEiIHkxPSIxMS4xIiB4Mj0iMTIuMSIgeTI9IjExLjEiLz4NCgk8bGluZSBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI0LjEiIHkxPSIxMi40IiB4Mj0iMTIuMSIgeTI9IjEyLjQiLz4NCgk8bGluZSBmaWxsPSIjRkZGRkZGIiBzdHJva2U9IiM5OTk5OTkiIHN0cm9rZS13aWR0aD0iMC4zIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHgxPSI0LjEiIHkxPSIxMy44IiB4Mj0iMTIuMSIgeTI9IjEzLjgiLz4NCgk8Y2lyY2xlIGZpbGw9IiNGRkZGRkYiIGN4PSI1LjQiIGN5PSI1LjEiIHI9IjIuNCIvPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNS41LDVWMi44YzEuMiwwLjEsMi4xLDEsMi4yLDIuMkg1LjV6Ii8+DQoJCTxwYXRoIGZpbGw9IiNEMTc3MDAiIGQ9Ik01LjcsM2MxLDAuMSwxLjcsMC45LDEuOSwxLjlINS43VjMgTTUuNCwyLjd2Mi41aDIuNUM3LjksMy43LDYuOCwyLjcsNS40LDIuN0w1LjQsMi43eiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K';
    this.iconpath['PDF'] = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNC4yLDE1LjdjLTEsMC0xLjgtMC44LTEuOC0xLjhWMmMwLTEsMC44LTEuOCwxLjgtMS44SDExbDMsM3YxMC43YzAsMS0wLjgsMS44LTEuOCwxLjhINC4yeiIvPg0KCQk8cGF0aCBmaWxsPSIjRERBQkFCIiBkPSJNMTAuOCwwLjRsMi45LDIuOXYxMC42YzAsMC45LTAuNywxLjctMS43LDEuN0g0LjJjLTAuOSwwLTEuNy0wLjctMS43LTEuN1YyYzAtMC45LDAuNy0xLjcsMS43LTEuN2g2LjYNCgkJCSBNMTEsMC4xSDQuMmMtMS4xLDAtMiwwLjktMiwydjExLjhjMCwxLjEsMC45LDIsMiwyaDcuOWMxLjEsMCwyLTAuOSwyLTJWMy4yTDExLDAuMUwxMSwwLjF6Ii8+DQoJPC9nPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRTI0NDQ0IiBkPSJNMTIuMiwxNS44SDQuMWMtMSwwLTEuOS0wLjgtMS45LTEuOWwwLDBjMC0wLjcsMC0xLjksMC0xLjloMTEuOWMwLDAsMCwxLjIsMCwxLjlsMCwwDQoJCQlDMTQuMSwxNSwxMy4yLDE1LjgsMTIuMiwxNS44eiIvPg0KCTwvZz4NCgk8ZyBlbmFibGUtYmFja2dyb3VuZD0ibmV3ICAgICI+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik01LjIsMTMuOWMtMC4yLDAuMi0wLjQsMC4yLTAuNywwLjJINC40djAuOUgzLjl2LTIuNWgwLjZjMC4zLDAsMC41LDAsMC43LDAuMmMwLjIsMC4xLDAuMiwwLjMsMC4yLDAuNg0KCQkJQzUuNSwxMy42LDUuNCwxMy44LDUuMiwxMy45eiBNNC41LDEzSDQuNHYwLjdoMC4xYzAuMiwwLDAuNSwwLDAuNS0wLjNDNSwxMy4xLDQuOCwxMyw0LjUsMTN6Ii8+DQoJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik03LjEsMTQuOWMtMC4yLDAuMS0wLjYsMC4yLTAuOCwwLjJINS43di0yLjVoMC42YzAuMywwLDAuNywwLDEsMC4zYzAuMywwLjIsMC40LDAuNiwwLjQsMQ0KCQkJQzcuNywxNC4zLDcuNSwxNC43LDcuMSwxNC45eiBNNywxMy4yQzYuOCwxMyw2LjUsMTMsNi4yLDEzdjEuNmgwLjFjMC4yLDAsMC40LDAsMC42LTAuMWMwLjItMC4xLDAuNC0wLjQsMC40LTAuNw0KCQkJQzcuMywxMy42LDcuMiwxMy40LDcsMTMuMnoiLz4NCgkJPHBhdGggZmlsbD0iI0ZGRkZGRiIgZD0iTTguNSwxM3YwLjZoMC44VjE0SDguNXYxSDguMXYtMi41aDEuM1YxM0g4LjV6Ii8+DQoJPC9nPg0KCTxwYXRoIGZpbGw9IiNFMjQ0NDQiIGQ9Ik0xNC4xLDMuMmMtMC44LDAtMiwwLjEtMi42LTAuNVMxMSwwLjksMTEsMC4xTDE0LjEsMy4yeiIvPg0KCTxwYXRoIGZpbGw9IiNFMjQ0NDQiIGQ9Ik0xMi43LDcuNWMwLjEtMC42LTAuOC0wLjgtMi44LTAuNWMtMC44LTAuNS0xLjUtMS4yLTItMi41QzgsMy43LDguMSwzLjEsOC4xLDIuOEM4LDMuMiw3LjcsNC4xLDcuNyw0LjENCgkJUzcuMiwyLjIsNy42LDEuNkM4LDEuOSw4LDIuNSw4LDIuN2MwLTAuMiwwLjMtMC45LTAuNC0xLjFDNi45LDEuMyw2LjgsMi40LDcuNSw0LjdjLTAuNywxLjctMi43LDUuNi0zLjYsNS42Yy0wLjItMC41LDEuNi0yLDEuNi0yDQoJCWMtMC44LDAuNC0yLDEuMi0xLjksMS45QzMuNywxMC40LDQsMTAuNSw0LDEwLjVzMC44LDAuMywyLjItMi4zYzAuOS0wLjQsMy40LTAuOCwzLjQtMC44czIuOSwxLjUsMywwLjRjLTAuMSwwLjEtMC4zLDAuNi0yLjMtMC40DQoJCUMxMS44LDcuMSwxMi41LDcuMiwxMi43LDcuNXogTTYuMyw4YzAuNS0wLjcsMS40LTIuOCwxLjQtMi44QzguNCw2LjUsOS4xLDcsOS4zLDcuMUM4LjksNy4yLDcsNy42LDYuMyw4eiIvPg0KPC9nPg0KPC9zdmc+DQo=';
    this.iconpath['Text'] = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNC4zLDE1LjdjLTEsMC0xLjgtMC44LTEuOC0xLjhWMi4xYzAtMSwwLjgtMS44LDEuOC0xLjhoNi44bDMsM1YxNGMwLDEtMC44LDEuOC0xLjgsMS44aC04VjE1Ljd6Ii8+DQoJCTxwYXRoIGZpbGw9IiM5OTk5OTkiIGQ9Ik0xMSwwLjRsMi45LDIuOXYxMC42YzAsMC45LTAuNywxLjctMS43LDEuN0g0LjNjLTAuOSwwLTEuNy0wLjctMS43LTEuN1YyLjFjMC0wLjksMC43LTEuNywxLjctMS43TDExLDAuNA0KCQkJIE0xMS4xLDAuMUg0LjNjLTEuMSwwLTIsMC45LTIsMnYxMS44YzAsMS4xLDAuOSwyLDIsMmg3LjljMS4xLDAsMi0wLjksMi0yVjMuMkwxMS4xLDAuMUwxMS4xLDAuMXoiLz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iIzk5OTk5OSIgZD0iTTE0LjIsMy4yYy0wLjgsMC0yLDAuMS0yLjYtMC41QzExLDIuMiwxMS4xLDEsMTEuMSwwLjFMMTQuMiwzLjJ6Ii8+DQo8L2c+DQo8Zz4NCgk8cGF0aCBmaWxsPSIjOTk5OTk5IiBkPSJNMTIuMywxNS45SDQuMmMtMSwwLTEuOS0wLjgtMS45LTEuOXYwYzAtMC43LDAtMS45LDAtMS45aDExLjljMCwwLDAsMS4yLDAsMS45djANCgkJQzE0LjIsMTUuMSwxMy4zLDE1LjksMTIuMywxNS45eiIvPg0KPC9nPg0KPGxpbmUgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjAuMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNC4yIiB5MT0iNS41IiB4Mj0iMTIuMiIgeTI9IjUuNSIvPg0KPGxpbmUgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjAuMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNC4yIiB5MT0iNi44IiB4Mj0iMTIuMiIgeTI9IjYuOCIvPg0KPGxpbmUgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjAuMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNC4yIiB5MT0iOC4xIiB4Mj0iMTIuMiIgeTI9IjguMSIvPg0KPGxpbmUgZmlsbD0iI0ZGRkZGRiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjAuMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiB4MT0iNC4xIiB5MT0iOS40IiB4Mj0iMTIuMSIgeTI9IjkuNCIvPg0KPC9zdmc+DQo=';
    this.iconpath['default'] = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxnPg0KCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNNC4zLDE1LjdjLTEsMC0xLjgtMC44LTEuOC0xLjhWMi4xYzAtMSwwLjgtMS44LDEuOC0xLjhoNi44bDMsM3YxMC43YzAsMS0wLjgsMS44LTEuOCwxLjhINC4zeiIvPg0KCQk8cGF0aCBmaWxsPSIjOTk5OTk5IiBkPSJNMTEsMC40bDIuOSwyLjl2MTAuNmMwLDAuOS0wLjcsMS43LTEuNywxLjdINC4zYy0wLjksMC0xLjctMC43LTEuNy0xLjdWMi4xYzAtMC45LDAuNy0xLjcsMS43LTEuN0gxMQ0KCQkJIE0xMS4xLDAuMUg0LjNjLTEuMSwwLTIsMC45LTIsMnYxMS44YzAsMS4xLDAuOSwyLDIsMmg3LjljMS4xLDAsMi0wLjksMi0yVjMuMkwxMS4xLDAuMUwxMS4xLDAuMXoiLz4NCgk8L2c+DQoJPHBhdGggZmlsbD0iIzk5OTk5OSIgZD0iTTE0LjIsMy4yYy0wLjgsMC0yLDAuMS0yLjYtMC41QzExLDIuMiwxMS4xLDEsMTEuMSwwLjFMMTQuMiwzLjJ6Ii8+DQo8L2c+DQo8L3N2Zz4NCg==';
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
