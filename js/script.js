// ---- 1st page: fill data in .week-of-year and .calender-container

var fillCalender = function(today) {

  // fill year
  var thisYear = today.getFullYear();
  $('#this-year-num').text(thisYear);

  // fill week
  var thisDay = today.getDay();
  var firstDayThisYear = new Date(Date.parse('Jan 1, ' + thisYear));
  var daysFromFirstDay = Math.floor((today - firstDayThisYear) / 86400000);
  var thisWeek = Math.ceil((daysFromFirstDay + thisDay + 7 * (firstDayThisYear.getDay() === 0) - 1) / 7);
  $('#this-week-num').text(thisWeek);

  // fill date in week
  $('.date-in-week').each(function(index) {
    var weekNumTemp = new Date(today - 86400000 * (thisDay - index - 1 + 7*(thisDay === 0)));
    if (index == 5 || index == 6) {
      $(this).text((weekNumTemp.getMonth() + 1) + '.' + weekNumTemp.getDate());
    }
    else {
      $(this).text(weekNumTemp.getDate());
    }
  });

};

fillCalender(new Date());


// ---- 1st page: handle user's select of city, default is beijing

var selectedCity = 'beijing';
var selectedCityCN = '北京';  // CN characters for amap

var selectCity = function() {
  $('#city-selected>span').text($(this).text());
  selectedCity = $(this).attr('id');
  selectedCityCN = $(this).text();
};

$('.city-item').each(function() {
  $(this).on('click', selectCity);
});

$('.city-to-event, .event-to-city').each(function() {
  $(this).click(function() {
    $('.city-select-container').toggleClass('city-select-container--shift');
    $('.event-select-container').toggleClass('event-select-container--shift');
  })
});


// 2nd page: ----handle user's select of event category

var eventCate = [];

var selectEventCate = function() {

  if (eventCate.indexOf($(this).attr('id')) === -1) {
    if ($(this).attr('id') === 'all' && eventCate.length >= 1) {
      eventCate.splice(0, eventCate.length);
      $('.event-cate[addToCate="true"]').each(function() {
        $(this).attr('addToCate', false);
      });
    } else {
      if (eventCate.indexOf('all') !== -1) {
        eventCate.splice(eventCate.indexOf('all'), 1);
        $('#all').attr('addToCate', false);
      };
    };
    eventCate.push($(this).attr('id'));
    $(this).attr('addToCate', true);
  } else {
    $(this).attr('addToCate', false);
    eventCate.splice(eventCate.indexOf($(this).attr('id')), 1);
  };

  $('.event-cate').each(function() {
    if ($(this).attr('addToCate') === 'true') {
      $(this).addClass('event-cate--selected');
    }
    else {
      $(this).removeClass('event-cate--selected');
    }
  });
}

$('.event-cate').each(function() {
  $(this).attr('addToCate', false);
  $(this).on('click', selectEventCate);
});


// ---- 3rd page: handle AJAX requests

var ajaxEventCate = [];
// `ajaxEventCate` is an array with the same length of `eventCate`. It is
// generated by ajaxCateGenerator() for functionality in launchDoubanAJAX().
var ajaxCateGenerator = function(originalCate) {
  var ajaxCate = [];
  for (var i = 0; i < originalCate.length; i++) {
    ajaxCate[i] = {
      cateName: originalCate[i],
      noMoreEvents: false,
      dataAppended: false
    };
  };
  ajaxCate.requestNum = 0
  return ajaxCate;
}

var launchDoubanAJAX = function() {

  // turn off eventListener for scrollAndLoad temporarily when a AJAX request
  // is just sent
  $(window).off('scroll', scrollAndLoad);

  // see if user has selected a category
  if (ajaxEventCate.length) {
    for (var i = 0; i < ajaxEventCate.length; i++) {
      // fire AJAX request for each category that still has events on the server
      if (!ajaxEventCate[i].noMoreEvents) {
        // for each category, set prop `dataAppended` to false before getting
        // data back and successfully appending them to DOM
        ajaxEventCate[i].dataAppended = false;

        var eventURL = 'https://api.douban.com/v2/event/list?loc='
          + selectedCity + '&day_type=weekend&type=' + ajaxEventCate[i].cateName
          + '&start=' + 20 * ajaxEventCate.requestNum;
        $.ajax({
          url: eventURL,
          dataType: 'jsonp'
        }).done(function(data) {
          var allEventsParentNode = $('.all-events');
          
          // append events to `allEventsParentNode`
          for (var i = 0; i < data.events.length; i++) {
            var singleEventData = data.events[i];
            var eventCardNode = document.querySelector('#event-card-template');
            var eventImg = eventCardNode.content.querySelector('.event-img');
            var eventTitle = eventCardNode.content.querySelector('.event-title a');
            var eventTime = eventCardNode.content.querySelector('.event-time');
            var eventAddress = eventCardNode.content.querySelector('.event-address');
            var eventFee = eventCardNode.content.querySelector('.event-fee');
            eventImg.src = 'img/eventcard-backup.png';
            eventImg.src = singleEventData.image;
            eventTitle.textContent = singleEventData.title;
            eventTitle.href = singleEventData.url;
            eventTime.textContent = '时间：' + singleEventData.time_str;
            eventAddress.textContent = '地点：' + singleEventData.address;
            eventFee.textContent = '费用：' + singleEventData.fee_str;
            var cloneEventCard = document.importNode(eventCardNode.content, true);
            allEventsParentNode.append(cloneEventCard);
          };

          // when a set of data sent back from server, we have to get its category
          // because we allow user to choose more than one category
          for (var i = 0; i < ajaxEventCate.length; i++) {
            if (this.url.includes('type=' + ajaxEventCate[i].cateName)) {
              var thisCate = ajaxEventCate[i].cateName;
              var thisCateIndex = i;
              break;
            };
          };

          // set certain category's `dataAppended` to true
          ajaxEventCate[thisCateIndex].dataAppended = true;
          // check if there are still more events on the server for this certain
          // category
          if (data.total <= 20 * (ajaxEventCate.requestNum + 1)) {
            ajaxEventCate[thisCateIndex].noMoreEvents = true;
          };

          // check if all requests have their data sent back
          for (var i = 0; i < ajaxEventCate.length; i++) {
            if (!ajaxEventCate[i].dataAppended) {
              return;
            };
          };

          // if all requests have their data sent back, check if there are still
          // more events on the server for every category
          for (var i = 0; i < ajaxEventCate.length; i++) {
            if (!ajaxEventCate[i].noMoreEvents) {
              ajaxEventCate.requestNum++;
              // if there are still more events on the server for some category,
              // start listening to `scroll` events
              $(window).on('scroll', scrollAndLoad);
              return;
            };
          };

          // if (all requests have their data sent back, and) there are no more
          // events for all categories, inform the user
          var eventNotFoundMsg = (allEventsParentNode.children().length) ?
                '指定分类没有更多活动了哦' + '<br>' + '看看其他分类吧~' :
                '本周末没有指定分类的活动' + '<br>' + '换个分类试试吧~' ;
          $('.all-events').append('<p class="event-not-found-msg">' + eventNotFoundMsg + '</p>');
        });
      }
    };
  } else {
    // if no categories are selected, inform the iser
    $('.all-events').append('<p class="event-not-found-msg">' + '请先选定一个分类哦~' + '</p>');
  };
};

var scrollAndLoad = function() {
  var contentHeightRemain = $(document).height() - $(this).scrollTop();
  if (contentHeightRemain <= $(this).innerHeight()*1.5) {
    launchDoubanAJAX(ajaxEventCate.requestNum);
  };
};


// ---- 3rd page: initialize map

var map;
var geocoder;

var initMap = function() {
  map = new AMap.Map('map', {
    resizeEnable: true,
    zoom: 20,
    center: [116.39,39.9],
    mapStyle: 'light'
  });
};


// ---- 3rd page: handle user's select(click) of events, add markers on map and
// descriptions aside

var eventCount = 0;
// `eventCount` to keep track of the number of events user selected
var addEventToMap = function() {

  var eventElement = $(this).parents('.event-card');

  if ( !eventElement.prop('class').includes('added') ) {

    var addEventAddress = eventElement.children('.event-address').text();
    geocoder.getLocation(addEventAddress, function(status, result) {

      if (status === 'complete' && result.info === 'OK') {
        eventCount++;

        // add a marker representing the address of the event to map
        var markerContentDiv = document.createElement('div');
        markerContentDiv.className = 'marker-count';
        markerContentDiv.innerHTML = eventCount;
        var marker = new AMap.Marker({
          position: [result.geocodes[0].location.lng, result.geocodes[0].location.lat],
          title: eventElement.children('.event-title').text(),
          content: markerContentDiv,
          map: map
        });

      } else {
        alert('未匹配活动地址，请自行搜索哦~');
      };

      // add description of the event taside
      $('.event-items-count span').text(eventCount);
      $('.event-items table').append(
        $('<tr/>')
          .addClass("event-item")
          .append(
            $('<td/>')
              .addClass("event-item-num")
              .text(eventCount) )
          .append(
            $('<td/>')
              .addClass("event-item-time")
              .text(eventElement.children('.event-time').text().slice(3) ) )
          .append(
            $('<td/>')
              .addClass("event-item-title")
              .html( eventElement.children('.event-title').html() ) )
      );
    });
  };

  eventElement.addClass('added');
};


// ---- 3rd page: get ready for user's interact

$('.event-to-list').click(function() {

  $('.calender-container').addClass('calender-container--hide');
  $('.event-cate-container').addClass('event-cate-container--small');
  $('.events-container').addClass('events-container--flex');

  $('.all-events').empty();

  // ---- ABOUT AJAX
  ajaxEventCate = ajaxCateGenerator(eventCate);
  launchDoubanAJAX(ajaxEventCate.requestNum);

  $('.event-cate-filter').click(function() {
    $('.all-events').empty();
    ajaxEventCate = ajaxCateGenerator(eventCate);
    launchDoubanAJAX(ajaxEventCate.requestNum);
  })

  // ABOUT map
  map.setCity(selectedCityCN);

  AMap.service('AMap.Geocoder', function() {
    geocoder = new AMap.Geocoder({
      city: selectedCityCN
    });
  });

  $('.all-events').on('click', '.add-to-map', addEventToMap);

  // ABOUT back-to-top icon
  $(window).on('scroll', function() {
    if ( $(this).scrollTop() > 260 ) {
      $('.to-top').addClass('to-top--display');
    } else {
      $('.to-top').removeClass('to-top--display');
    }
  });

  $('.events-container').on('click', '.to-top', function() {
    $(window).scrollTop(0);
  });

});
