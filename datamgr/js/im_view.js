var toIP = '';
var toAccount= '';
var toUID='';
var sendTime = '';
var localAccount='';
var localUID='';

function _IM_View() {
}

_IM_View.prototype = {

  showRec: function(msgobj) {
    var msg = msgobj['MsgObj'];
    toIP = msgobj['IP'];
    toAccount = msg.from;
    var msgtime = new Date();
    msgtime.setTime(msg.time);
    var time = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
    $('#header_title').text( toAccount);
    $("#popup_dialog").modal('show');
    document.getElementById('disp_text').value +=  msg.from + ' ' +  time + '  :\n' + msg.message + '\n\n';
  },

  showSend: function(to){ 
    toAccount = to["account"];
    toIP = to["ip"];
    toUID=to['device_id']; 
    $('#header_title').text( toAccount);
    $("#popup_dialog").modal('show'); 
  },

  init: function() {
    var title = toAccount;
    var message = '';
    var data_json = '';
    $("#popup_dialog").remove();
    var header_btn = $('<button type="button" id="top_close_btn" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
    var header_title = $('<h4 class="modal-title" id ="header_title"></h4>');
    header_title.text(title);
    var header = $('<div class="modal-header"></div>');
    header.append(header_btn).append(header_title);

    var body = $('<div class="modal-body"></div>');
    message = '<div> <textarea id="disp_text" readOnly="true" rows="10" cols="68"></textarea> </div> \
                         <p></p> \
                         <div> <textarea id="send_text" rows="5" cols="68"></textarea> </div> \
                         <p></p> \
                         <div align="right"> \
                          <button type="button"  id="close_button">关闭</button> \
                          <button type="button"  id="send_button">发送</button> \
                         </div> ';
    body.html(message);

    var content = $('<div class="modal-content"></div>');
    content.append(header);
    content.append(body);

    var dialog = $('<div class="modal-dialog"></div>');
    dialog.append(content);
    var div = $('<div id="popup_dialog" class="modal fade" data-backdrop="false"></div>');
    div.append(dialog);
    $('body').append(div);

    $('#send_button').on('click',function(){
      function sendIMMsgCb(){
        var msg = document.getElementById('send_text').value;
        document.getElementById('disp_text').value += localAccount + '   ' + sendTime + '  :\n' + msg + '\n\n';
        document.getElementById('send_text').value = '';
      }
      DataAPI.getLocalData(function(localData){
        localAccount=localData.account;
        localUID=localData.UID;
        var ipset = {};
        ipset["IP"] = toIP;
        ipset["UID"] = toUID;
        var msgtime = new Date();
        sendTime = msgtime.getHours() + ':' + msgtime.getMinutes() + ':' + msgtime.getSeconds();
        DataAPI.sendIMMsg(sendIMMsgCb,ipset, toAccount,document.getElementById('send_text').value);
      }); 
    });

    $('#close_button').on('click',function(){
      document.getElementById('disp_text').value = '';
      document.getElementById('send_text').value = '';
      $("#popup_dialog").modal('hide');
    });

    $('#top_close_btn').on('click',function(){
      document.getElementById('disp_text').value = '';
      document.getElementById('send_text').value = '';
      $("#popup_dialog").modal('hide');
    });
  }
};

(function() {
  im_view = new _IM_View();
})();
