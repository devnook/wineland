/**
 * @fileoverview Library for rendering cards.
 * Depends on http://beebole.com/pure js library.
 */


/**
 * Namespace.
 */
var cards = {};


/**
 * Used by pure.js to populate the template.
 * @type {Object.<string>}
 * @const
 */
cards.MAPPING_DIRECTIVE = {
  '.action': 'actionText',
  '.action@href': 'actionUrl',
  '.description': 'description',
  '.image@src': 'image',
  '.notableFor': 'notableFor',
  '.name': 'name',
  'li.wine': {
    'wine<-wines':{
     'a':'wine.text',
     'a@href':'wine.url'
    }
  }
};


/**
 * Used by pure.js to populate the template.
 * @type {Object.<string>}
 * @const
 */
cards.ARTICLE_MAPPING_DIRECTIVE = {
  '.action': 'actionText',
  '.action@href': 'actionUrl',
  '.description': 'description',
  '.image@src': 'image',
  '.notableFor': 'notableFor',
  '.name': 'name'
};


/**
 * Checks whether the card is currently displayed in the UI.
 * @param {string} mid Freebase topic id for a card.
 * @return {boolean} True if card is currently displayed.
 */
cards.isCardDisplayed = function(mid) {
  return !!$('.card[data-mid="' + mid + '"]').length;
};

cards.pathRegex = /#\/region\/m:(\w*)(\/wine\/m:)?(\w*)?/;

//TODO(ewag): Change to plugin for cross-browser.
$(window).bind( 'hashchange', function() {
  cards.loadState()
});


//TODO(ewag): Change to plugin for cross-browser.
cards.loadState = function() {
  var state = cards.pathRegex.exec(location.hash);
  if (state) {
    var regionMid = 'm/' + state[1];
    console.log(regionMid)
    if ($('.card').attr('data-mid') !=  regionMid) {
      console.log('send')
      $('.article-wrapper').removeClass('open');
       $.getJSON(fbmap.topicUrl + regionMid + '?filter=all', cards.displayCard);
    }
    if (state[3]) {
      var wineMid = 'm/' + state[3];
      if ($('.article').attr('data-mid') != wineMid) {
         $.getJSON(fbmap.topicUrl + wineMid + '?filter=all', cards.displayArticle);
      }
    }
  }
 };



/**
 * Displays a card.
 * @param {Object} entity Freebase topic/entity.
 */
cards.displayArticle = function(entity) {
  console.log(entity)
  //$('.card').addClass('visible');
  $('.article').attr('data-mid', entity.id);
  var cardContent = {
    'name': entity.property['/type/object/name'].values[0].value,
    'notableFor': '',
    'image': 'images/none.gif',

  };
  if (entity.property['/common/topic/notable_for']) {
    cardContent['notableFor'] = entity.property['/common/topic/notable_for']
        .values[0].text;
  }
  if (entity.property['/common/topic/image']) {
    cardContent['image'] = 'https://www.googleapis.com/freebase/v1/image/' +
        entity.property['/common/topic/image'].values[0].id + '?maxwidth=260';
  }
  if (entity.property['/common/topic/official_website']) {
    cardContent['actionUrl'] = entity.property['/common/topic/official_website']
        .values[0].value;
    cardContent['actionText'] = 'Visit official website';
  }
  $('div.article').render(cardContent, cards.ARTICLE_MAPPING_DIRECTIVE);
  $('.article-wrapper').addClass('open');

};

/**
 * Displays a card.
 * @param {Object} entity Freebase topic/entity.
 */
cards.displayCard = function(entity) {

  console.log(entity)
  //$('.card').addClass('visible');




  $('.card').attr('data-mid', entity.id.substring(1));
  var cardContent = {
    'name': entity.property['/type/object/name'].values[0].value,
    'description': entity.property['/common/topic/description'].values[0].text,
    'notableFor': '',
    'image': 'images/none.gif',
    'actionUrl': '',
    'actionText': '',
    'wines': [{'text': '', 'url': ''}]
  };
  if (entity.property['/common/topic/notable_for']) {
    cardContent['notableFor'] = entity.property['/common/topic/notable_for']
        .values[0].text;
  }
  if (entity.property['/common/topic/image']) {
    cardContent['image'] = 'https://www.googleapis.com/freebase/v1/image/' +
        entity.property['/common/topic/image'].values[0].id + '?maxwidth=260';
  }
  if (entity.property['/common/topic/official_website']) {
    cardContent['actionUrl'] = entity.property['/common/topic/official_website']
        .values[0].value;
    cardContent['actionText'] = 'Visit official website';
  }
  if (entity.property['/wine/wine_sub_region/wines']) {
    cardContent['wines'] = [];
    var regionMid = entity.id.substring(1).replace('/', ':');
    for (var i = 0, wine; wine = entity.property['/wine/wine_sub_region/wines'].values[i]; i++) {
      var wineMid = wine.id.substring(1).replace('/', ':');
      cardContent['wines'].push({ 'text': wine.text, 'url': '/#/region/' + regionMid + '/wine/' + wineMid });
    }
    //cardContent['featuredInFilmsDisplay'] = true;
  }
  $('div.card').render(cardContent, cards.MAPPING_DIRECTIVE)
    .delay(400);
  $('#sidebar').addClass('open');


};

cards.loadState();
