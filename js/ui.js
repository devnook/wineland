/**
 * @fileoverview The interactive app UI.
 */


/**
 * Initializes the UI.
 */
fbmap.initialize = function() {
  var lat = 40;  // Default: San Francisco.
  var lng = -33;  // Default: San Francisco.
  fbmap.initMap(lat, lng);
};

google.maps.event.addDomListener(window, 'load', fbmap.initialize);
