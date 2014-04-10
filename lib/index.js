'use strict';
var pluck = require('./pluck');
var parser = require('./parser');

function isUndef(v) {
  return v === undefined;
}

// Recursively walk
function _pluckDeep(coll, selectors) {
  // No more selectors
  if (!selectors.length) return coll;

  // Pluck the current value from the given selector
  var p = pluck(coll, selectors[0]);

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
  return _pluckDeep(coll, parser(selector));
};
