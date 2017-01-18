var today = new Date();
// var today = new Date(Date.parse('Jan 22, 2017'));
var getThisWeek = function(date) {
  var firstDayThisYear = new Date(Date.parse('Jan 1, ' + date.getFullYear()));
  var daysFromFirstDay = Math.floor((today - firstDayThisYear) / 86400000);
  var weekNum = Math.floor((daysFromFirstDay + date.getDay() + 7*(firstDayThisYear.getDay()==0) - 1) / 7) + 1;
  return weekNum;
}

var thisYear = today.getFullYear();
var thisWeek = getThisWeek(today);

$('#this-year-num').text(thisYear);
$('#this-week-num').text(thisWeek);

$('.date-in-week').each(function() {
  var i = $('.date-in-week').index($(this));
  var weekNumTemp = new Date(today - 86400000 * (today.getDay() - i - 1 + 7*(today.getDay()==0)));
  if (i == 5 || i == 6) {
    $(this).text((weekNumTemp.getMonth() + 1) + '.' + weekNumTemp.getDate());
  }
  else {
    $(this).text(weekNumTemp.getDate());
  }
});

//////

var theCity = $('#city-selected');
var cityList = $('#all-cities-container');
var cityContainer = $('#city-selected-container');
var cityItems = $('.city-item');

theCity.hover(function() {
  cityList.css('display', 'block');
});

cityContainer.mouseleave(function() {
  cityList.css('display', 'none');
});

var selectedCity = 'beijing';

cityItems.each(function() {
  $(this).click(function() {
    $('#city-selected>span').text($(this).text());
    selectedCity = $(this).attr('id');
    cityList.css('display', 'none');
  });
});

$('.city-to-event').click(function() {
  $('.city-select-container').css('display', 'none');
  $('.event-select-container').css('display', 'block');
});

/////////////////////

$('.event-to-city').click(function() {
  $('.city-select-container').css('display', 'flex');
  $('.event-select-container').css('display', 'none');
});

var eventCate = [];
var eventCateCN = [];

$('.event-cate').each(function() {
  $(this).attr('addToCate', false);
  $(this).click(function() {
    if (eventCate.indexOf($(this).attr('id')) == -1) {
      if ($(this).attr('id') == 'all' && eventCate.length >= 1) {
        eventCate.splice(0, eventCate.length);
        eventCateCN.splice(0, eventCateCN.length);
        $('.event-cate[addToCate="true"]').each(function() {
          console.log('yeah!');
          $(this).attr('addToCate', false);
        });
      }
      else {
        if (eventCate.indexOf('all') !== -1) {
          eventCate.splice(eventCate.indexOf('all'), 1);
          eventCateCN.splice(eventCateCN.indexOf('全部'), 1);
          $('#all').attr('addToCate', false);
        }
      }
      eventCate.push($(this).attr('id'));
      eventCateCN.push($(this).text());
      $(this).attr('addToCate', true);
    }
    else {
      $(this).attr('addToCate', false);
      eventCate.splice(eventCate.indexOf($(this).attr('id')), 1);
      eventCateCN.splice(eventCateCN.indexOf($(this).text()), 1);
    }
    $('.event-cate').each(function() {
      if ($(this).attr('addToCate') == 'true') {
        $(this).addClass('cate-selected');
      }
      else {
        $(this).removeClass('cate-selected');
      }
    });
    console.log(eventCate);
    console.log(eventCateCN);
  });
});

////////////

// $('.event-to-list').click(function() {
//   // $('#selected-cate-char').load(function() {
//     console.log('123!');
//     if (eventCate.length) {
//       for (var i = 0; i < eventCate.length; i++) {
//         var eventURL = 'https://api.douban.com/v2/event/list?loc=' + selectedCity +
//         '&day_type=weekend&type=' + eventCate[i];
//         console.log(eventURL);
//         $.ajax({
//           url: eventURL,
//           dataType: 'jsonp'
//         }).done(function(data) {
//           console.log(data);
//         });
//       }
//     }
//     var eventCateChar = eventCateCN.join('、');
//     console.log(eventCateChar);
//     $('#selected-cate-char').text(eventCateChar);
//   // });
// });
