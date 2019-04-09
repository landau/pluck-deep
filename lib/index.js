'use strict';

const pluck = require('./pluck');
const parser = require('./parser');

const parseSelector = parser.parseSelector;
const parseFilter = parser.parseFilter;

function isUndef(v) {
  return v === undefined;
}

function filterColl(coll, filter) {
  if (Array.isArray(coll)) {
    return coll.filter(item => item[filter.key] === filter.val);
  }

  return coll[filter.key] === filter.val ? coll : null;
}

// Recursively walk
function pluckDeepWithSelectors(coll, selectors) {
  // No more selectors
  if (!selectors.length) return coll;

  // Pluck the current value from the given selector
  let sel = selectors[0];

  let filtered = coll;

  // Filter if applicable
  const filter = parseFilter(sel);

  if (filter) {
    filtered = filterColl(coll, filter);

    if (!filtered || (Array.isArray(filtered) && !filtered.length)) return null;

    sel = filter.selector;
  }

  const p = pluck(filtered, sel);

  // No values found for current selector
  if (isUndef(p) || (Array.isArray(p) && p.some(isUndef))) {
    return null;
  }

  // Recursively call with the remaining selectors
  return pluckDeepWithSelectors(p, selectors.slice(1));
}

/**
 * Pluck values of an object given a 'dot' separated string
 *
 * @example 'foo.bar' returnsssssssssssssssssssss the value of bar for an obj
 *      { foo: 'bar' }. 'foo.bar.name' will return the value of 'name' for
 *      all objects within the array bar.
 *
 * @param {!Array | Object} coll -
 * @param {!string} selector -
 * @returns {*} -
 */
module.exports = function pluckDeep(coll, selector) {
  return pluckDeepWithSelectors(coll, parseSelector(selector));
};
