
var DataAPI;
var AppAPI;
var docData;
WDC.requireAPI(['data', 'app'], function(data, app){
  console.log("data:" +  data + " app:" + app);
  DataAPI=data;
  AppAPI=app;
});



// Detect window size, if less than 1280px add class 'mobile' to sidebar therefore it will be auto hide when trigger the pjax request in small screen devices.
if ($(window).width() <= 1280) {
  $('#sidebar').addClass('mobile')
}

// Variables
  homePage = HomePage.create();
  search = Search.create();
  infoList = InfoList.create();
  infoList.attach($('#sidebar'));
  infoList.setTitle();
  infoList._infoList.hide();
  var sidebar    = $('#sidebar'),
  container  = $('#container'),
  content    = $('#contentDiv');
  search.attach($('#searchDiv'));
  homePage.attach(content);

// infoList switcher
var clickHandler = function(k) {
  return function() {
    $(this).addClass('active').siblings().removeClass('active');
    content.children('div').hide();
    if(k == 1){
      infoList._infoList.hide();
      infoList.removeTags();
      infoList.removeRecent();
      container.removeClass('move-right');
      homePage.show();
    } else {
      infoList.setIndex(k);
      infoList.setContent();
      infoList.setTitle();
      infoList._infoList.show();
      infoList.loadData();
      homePage.hide();
      container.addClass('move-right');
    }
  }
};

for (var i = 1; i <= 6; i++) {
  $('#js-label' + i).on('click', clickHandler(i));
}
