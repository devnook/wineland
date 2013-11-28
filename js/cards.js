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
 * Checks whether the card is currently displayed in the UI.
 * @param {string} mid Freebase topic id for a card.
 * @return {boolean} True if card is currently displayed.
 */
cards.isCardDisplayed = function(mid) {
  return !!$('.card[data-mid="' + mid + '"]').length;
};


/**
 * Displays a card.
 * @param {Object} entity Freebase topic/entity.
 */
cards.displayCard = function(entity) {
  console.log(entity)

  $('.card').show();
  $('.card').attr('data-mid', entity.id);
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
    for (var i = 0, wine; wine = entity.property['/wine/wine_sub_region/wines'].values[i]; i++) {
      cardContent['wines'].push({ 'text': wine.text, 'url': 'http://freebase.com' + wine.id });
    }
    //cardContent['featuredInFilmsDisplay'] = true;
  }
  $('div.card').render(cardContent, cards.MAPPING_DIRECTIVE);

};
