
/*!--------------------------------*\
   3-Jekyll Theme
   @author Peiwen Lu (P233)
   https://github.com/P233/3-Jekyll
\*---------------------------------*/

// Detect window size, if less than 1280px add class 'mobile' to sidebar therefore it will be auto hide when trigger the pjax request in small screen devices.
if ($(window).width() <= 1280) {
  $('#sidebar').addClass('mobile')
}

// Variables
    search = Search.create();
    infoList = InfoList.create();
    infoList.attach($('#sidebar'));
    infoList.setTitle();
    infoList._infoList.hide();
var sidebar    = $('#sidebar'),
    container  = $('#container'),
    content    = $('#content');
    search.attach($('#searchDiv'));

// infoList switcher
var clickHandler = function(k) {
  return function() {
    $(this).addClass('active').siblings().removeClass('active');
    if(k == 1){
      infoList._infoList.hide();
      infoList.removeContent();
      container.removeClass('move-right');
    } else {
      infoList.setIndex(k);
      infoList.setContent();
      infoList.setTitle();
      infoList._infoList.show();
      infoList.loadData();
      container.addClass('move-right');
    }
  }
};

for (var i = 1; i <= 6; i++) {
  $('#js-label' + i).on('click', clickHandler(i));
}

