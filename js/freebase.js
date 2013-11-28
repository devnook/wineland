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
    styles: styles
  };

  fbmap.currentLatLng = mapOptions.center;

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
    $('.card').hide();
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
  // Create the Freebase API query.
  var loc = ' lon:' + latLng.lng() + ' lat:' + latLng.lat();
  loc = '(all type:' + fbmap.category + ' (within radius:500000000ft' + loc + '))';
  var params = {
    filter: loc,
    output: '(' + fbmap.locString + ')',
    limit: 200
  };
  $.getJSON(fbmap.searchUrl, params, fbmap.createMarkers);

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
  $('.card').hide();
};

fbmap.iconAnchorPoints = {
  '/symbols/namesake': new google.maps.Point(108, 240),
  '/film/film_location': new google.maps.Point(108, 312),
  '/visual_art/artwork': new google.maps.Point(216, 168),
  '/architecture/structure' : new google.maps.Point(216, 144),
  '/travel/tourist_attraction': new google.maps.Point(54, 504),
  '/sports/sports_facility': new google.maps.Point(162, 192),
  '/wine/wine_sub_region': new google.maps.Point(0, 48),
}


/**
 * Creates the markers and click events for freebase locations.
 * @param {object} response Freebase search response.
 */
fbmap.createMarkers = function(response) {
  fbmap.clearMap();
  if (!response.result) {
    console.log('no results');
  }
  console.log(response)
  var bounds = new google.maps.LatLngBounds();
  $.each(response.result, function(i, result) {
    var loc = result.output[fbmap.locString][fbmap.locString][0];
    var latLng = new google.maps.LatLng(loc.latitude, loc.longitude);
    // TODO(jivni): Use custom icons depending on the category.
    var icon = new google.maps.MarkerImage(
      "images/maki-sprite.png",
      new google.maps.Size(24, 24),
      fbmap.iconAnchorPoints[fbmap.category]);

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
        var params = {
          filter: '/wine/wine_sub_region/wines'
        };
        $.getJSON(fbmap.topicUrl + result.mid + '?filter=all', cards.displayCard);
      }
    });
  });
  if (response.result.length > 1) {
    // TODO(jlivni): Maybe only fit to bounds if the bounds are bigger than
    // current bounds.
    //fbmap.map.fitBounds(bounds);
  }
};
