var Contact = Class.extend({
  init:function(){
    this._contacts = ['Aaliyah', 'Abagail', 'Abi', 'Brian', 'Charies', 'Cindy'];
    this._ContactContainer = $('<div>',{
      'id': 'contact-container'
    })
    this._contactsList = $('<div>', {
      'id': 'contact-left'
    });
    this._ContactContainer.append(this._contactsList);
  },

  setContactsList:function(){
    var _this = this;
    DataAPI.getAllDataByCate(function(contact_json){
      _this._contacts = contact_json;
      var family_name_json = {};
      for(var i = 0; i < _this._contacts.length; i ++){
        var family_name = _this._contacts[i]['name'][0];
        if(family_name_json.hasOwnProperty(family_name)){
          family_name_json[family_name].push(_this._contacts[i]['name']);
        } else {
          family_name_json[family_name] = [_this._contacts[i]['name']];
        }
      }
      for(var i in family_name_json){
        var _p = $('<p>', {
          'class':'p-family',
          'text': i
        });
        for(var j = 0; j < family_name_json[i].length; j ++){
          var _name = $('<p>', {
            'class':'p-name',
            'text': family_name_json[i][j]
          });
          _p.append(_name);
        }
        _this._contactsList.append(_p);
      }
    }, 'Contact');
  },

  attach:function($parent_){
    $parent_.append(this._ContactContainer);
  }

});
