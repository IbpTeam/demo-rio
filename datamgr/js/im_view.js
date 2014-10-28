var ip = '127.0.0.1';

function _IM_View() {
}

_IM_View.prototype = {



  showRec: function(msg) {
    $("#popup_dialog").modal('show');
    document.getElementById('disp_text').value += 'Receive:\n' + msg + '\n\n';
  },

  showSend: function(to){
    ip = to["ip"];
    $("#popup_dialog").modal('show');
  },

  init: function() {
    var title = 'Talking';
    var message = '';
    var data_json = '';
    $("#popup_dialog").remove();
    var header_btn = $('<button type="button" id="top_close_btn" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
    var header_title = $('<h4 class="modal-title"></h4>');
    header_title.text(title);
    var header = $('<div class="modal-header"></div>');
    header.append(header_btn).append(header_title);

    var body = $('<div class="modal-body"></div>');
    message = '<div> <textarea id="disp_text" readOnly="true" rows="10" cols="68"></textarea> </div> \
                         <p></p> \
                         <div> <textarea id="send_text" rows="5" cols="68"></textarea> </div> \
                         <p></p> \
                         <div align="right"> \
                          <button type="button" class="btn btn-primary" id="close_button">close</button> \
                          <button type="button" class="btn btn-primary" id="send_button">send</button> \
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
    //$("#popup_dialog").modal('show');

    $('#send_button').on('click',function(){

      function sendIMMsgCb(){
        var msg = document.getElementById('send_text').value;
        document.getElementById('disp_text').value += 'Send: \n' + msg + '\n\n';
        document.getElementById('send_text').value = '';
      }

      var ipset = {};
      ipset["IP"] = ip;
      ipset["UID"] = "34234324r34rerfe45r4a";

      DataAPI.sendIMMsg(sendIMMsgCb,ipset, document.getElementById('send_text').value);
    });

    $('#close_button').on('click',function(){
      $("#popup_dialog").modal('hide');
      document.getElementById('disp_text').value = '';
      document.getElementById('send_text').value = '';
    });



  }

};


(function() {
  im_view = new _IM_View();
})();
