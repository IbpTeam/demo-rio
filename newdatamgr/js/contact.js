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
    DataAPI.getAllDataByCate(function(contact_json_){
      console.log("contact_json_=====", contact_json_);
      _this._contacts = contact_json_;
      var family_name_json = {};
      for(var i = 0; i < _this._contacts.length; i ++){
        var family_name = _this._contacts[i]['name'][0];
        if(family_name_json.hasOwnProperty(family_name)){
          family_name_json[family_name].push({
            name: _this._contacts[i]['name'],
            id: i
          });
        } else {
          family_name_json[family_name] = [{
            name: _this._contacts[i]['name'],
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
            'class':'a-name',
            'text': family_name_json[i][j]['name'],
            'id': family_name_json[i][j]['id']
          });
          _ul.append(_name);
        }
        _this._contactsList.append(_ul);
      }
      _this.bindAction();
    }, 'Contact');
  },

  bindAction: function(){
    $('.a-name').on('click', function(){
      alert(this.id);
    });
  },

  setHead: function(){

  },

  attach:function($parent_){
    $parent_.append(this._ContactContainer);
  }

});
