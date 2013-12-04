/**
 * @fileoverview Example maps app, allowing the user to view data from Freebase.
 */


var fbmap = {
  map: null,
  currentLatLng: null,
  markers: [], //Keep track of currently displayed markers.
  searchUrl: 'https://www.googleapis.com/freebase/v1/search',
  topicUrl: 'https://www.googleapis.com/freebase/v1/topic/',
  category: '/wine/wine_sub_region',
  locString: '/location/location/geolocation'
};

/**
 * Sets a flash message for the user.
 * @param {string} msg The content of the message.
 * @param {string=} opt_type The optional type of the message: error or info.
 */
fbmap.setFlash = function(msg, opt_type) {
  var type = opt_type || 'info';
  $('#flash').addClass(type).text(msg);
};


/**
 * Initializes the map, sets up base click listeners.
 * @param {number} lat Latitude for the map center.
 * @param {number} lng Longitude for the map center.
 */
fbmap.initMap = function(lat, lng) {

  var styles = [
  {
    "featureType": "landscape",
    "stylers": [
      { "saturation": 41 },
      { "hue": "#ffa200" },
      { "lightness": -20 },
      { "gamma": 0.7 }
    ]
  },{
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      { "saturation": -44 },
      { "hue": "#ff8000" },
      { "lightness": -39 },
      { "gamma": 0.69 }
    ]
  },{
    "featureType": "administrative.country",
    "elementType": "geometry.stroke",
    "stylers": [
      { "saturation": -46 },
      { "lightness": -13 },
      { "gamma": 2.11 },
      { "weight": 1.7 },
      { "color": "#d8b280" }
    ]
  },{
    "featureType": "administrative.province",
    "elementType": "labels.text",
    "stylers": [
      { "visibility": "off" }
    ]
  }
]

  //var styles = [];

  var mapOptions = {
    zoom: 3,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: styles,
    zoomControlOptions: {
        //style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.LEFT_CENTER
    },
    panControl: false,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.BOTTOM_LEFT

    }
  };

  fbmap.currentLatLng = mapOptions.center;
  console.log($('.navbar').height())
  //$('#map-canvas').css('height',$(window).height() - $('.navbar').height() + 30 + 'px')

  fbmap.map = new google.maps.Map($('#map-canvas')[0], mapOptions);
  // Query for new features on a click.  TODO(jlivni): Maybe query on a pan.
  google.maps.event.addListener(fbmap.map, 'click', function(e) {
    console.log(e.latLng)
    fbmap.currentLatLng = e.latLng;
    fbmap.getFreebaseLocations();
  });

  // Listen for changes on which category to query.  TODO(jlivni): Consider
  // multiple categories.
  $('#category').change(function() {
    //$('.card').hide();
    fbmap.category = $(this).val();
    fbmap.getFreebaseLocations();
  });

  // Put the dropdown on the map div.
  var categoryEl = $('#category')[0];
  fbmap.map.controls[google.maps.ControlPosition.TOP_LEFT].push(categoryEl);

  fbmap.getFreebaseLocations();
};


/**
 * Queries for new freebase locations.
 */
fbmap.getFreebaseLocations = function() {
  var latLng = fbmap.currentLatLng;

  var types = [
    '/wine/wine_region',
    '/wine/wine_sub_region',
    '/wine/vineyard'
  ];

  for (var i = 0, type; type = types[i]; i++) {
    var loc = ' lon:' + latLng.lng() + ' lat:' + latLng.lat();
    var filter = '(all type:' + type + ' (within radius:500000000ft' + loc + '))';
    var params = {
      filter: filter,
      output: '(/location/location/geolocation)',
      limit: 200
    };
    console.log(type)
    var callback = function(type) {
      return function(response) {
        console.log(type)
        console.log(response)
        //fbmap.clearMap();
        if (!response.result) {
          console.log('no results');
        }
        var bounds = new google.maps.LatLngBounds();
        $.each(response.result, function(i, result) {
          var loc = result.output[fbmap.locString][fbmap.locString][0];
          var latLng = new google.maps.LatLng(loc.latitude, loc.longitude);

          var icon = new google.maps.MarkerImage(
            "images/sprites.png",
            new google.maps.Size(25, 25),
            fbmap.iconAnchorPoints[type]);

          var marker = new google.maps.Marker({
            position: latLng,
            map: fbmap.map,
            title: result.name,
            icon: icon
          });


          fbmap.markers.push(marker);
          // Keep track of the bounding box of all results.
          bounds.extend(latLng);
          google.maps.event.addListener(marker, 'click', function() {
            if (!cards.isCardDisplayed(result.mid)) {
              var mid = result.mid.substring(1).replace('/', ':');
              window.location.hash = '#/region/' + mid;
              //$(window).trigger( "hashchange" );
              //$.getJSON(fbmap.topicUrl + result.mid + '?filter=all', cards.displayCard);
            }
          });
        });
        if (response.result.length > 1) {
          // TODO(jlivni): Maybe only fit to bounds if the bounds are bigger than
          // current bounds.
          //fbmap.map.fitBounds(bounds);
        }
      };




    }

    $.getJSON(fbmap.searchUrl, params, callback(type));
  }

  //https://www.googleapis.com/freebase/v1/search?filter=(all+type%3A%2Fwine%2Fwine_sub_region+(within+radius%3A5000000ft+lon%3A-0.14219419999994898+lat%3A51.536543599999995))&output=(%2Flocation%2Flocation%2Fgeolocation)
};


/**
 * Clears the map of all markers and cards.
 */
fbmap.clearMap = function() {
  // Loop through all currently displayed markers and remove from map.
  $.each(fbmap.markers, function(i, marker) {
    marker.setMap(null);
  });
  fbmap.markers = [];
  //$('.card').hide();
};

fbmap.iconAnchorPoints = {
  '/wine/vineyard': new google.maps.Point(21, 0),
  '/wine/wine_region': new google.maps.Point(0, 0),
  '/wine/wine_sub_region': new google.maps.Point(42, 0),
}


/**
 * Creates the markers and click events for freebase locations.
 * @param {object} response Freebase search response.
 */
fbmap.createMarkers = function(response, type) {
  console.log(type)
  console.log(response)
  //fbmap.clearMap();
  if (!response.result) {
    console.log('no results');
  }
  console.log(response)
  var bounds = new google.maps.LatLngBounds();
  $.each(response.result, function(i, result) {
    var loc = result.output[fbmap.locString][fbmap.locString][0];
    var latLng = new google.maps.LatLng(loc.latitude, loc.longitude);
    // TODO(jivni): Use custom icons depending on the category.

    console.log
    var icon = new google.maps.MarkerImage(
      "images/sprites.png",
      new google.maps.Size(25, 25),
      fbmap.iconAnchorPoints[type]);

    var marker = new google.maps.Marker({
      position: latLng,
      map: fbmap.map,
      title: result.name,
      icon: icon
    });


    fbmap.markers.push(marker);
    // Keep track of the bounding box of all results.
    bounds.extend(latLng);
    google.maps.event.addListener(marker, 'click', function() {
      if (!cards.isCardDisplayed(result.mid)) {
        var mid = result.mid.substring(1).replace('/', ':');
        window.location.hash = '#/region/' + mid;
        //$(window).trigger( "hashchange" );
        //$.getJSON(fbmap.topicUrl + result.mid + '?filter=all', cards.displayCard);
      }
    });
  });
  if (response.result.length > 1) {
    // TODO(jlivni): Maybe only fit to bounds if the bounds are bigger than
    // current bounds.
    //fbmap.map.fitBounds(bounds);
  }
};
