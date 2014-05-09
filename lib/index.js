'use strict';
var pluck = require('./pluck');
var parser = require('./parser');
var parseSelector = parser.parseSelector;
var parseFilter = parser.parseFilter;

function isUndef(v) {
  return v === undefined;
}

function filterColl(coll, filter) {
  var filtered = null;

  if (Array.isArray(coll)) {
    filtered = coll.filter(function(item) {
      return item[filter.key] === filter.val;
    });
  } else {
    filtered = coll[filter.key] === filter.val ? coll : null;
  }

  return filtered;
}

// Recursively walk
function _pluckDeep(coll, selectors) {
  // No more selectors
  if (!selectors.length) return coll;

  // Pluck the current value from the given selector
  var sel = selectors[0];

  var filtered = coll;

  // Filter if applicable
  var filter = parseFilter(sel);

  if (filter) {
    filtered = filterColl(coll, filter);

    if (!filtered || (Array.isArray(filtered) && !filtered.length)) return null;

    sel = filter.selector;
  }

  var p = pluck(filtered, sel);

  // No values found for current selector
  if (isUndef(p) || (Array.isArray(p) && p.some(isUndef))) {
    return null;
  }

  // Recursively call with the remaining selectors
  return _pluckDeep(p, selectors.slice(1));
}

/**
 * Pluck values of an object given a 'dot' separated string
 * ex: 'foo.bar' returns the value of bar for an obj { foo: 'bar' }.
 *     'foo.bar.name' will return the value of 'name' for all objects
 *     within the array bar.
 *
 * @param {array|object} coll
 * @param {string} selector
 *
 * @return {*}
 */
module.exports = function pluckDeep(coll, selector) {
  return _pluckDeep(coll, parseSelector(selector));
};
