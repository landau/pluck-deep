'use strict';

const SPLIT_CHAR = '.';
const rgx = /\[(.+)=(.+)\]/;
const isDigit = /^\d+$/;

function trim(s) {
  return s.trim();
}

function parseSelector(str) {
  return str.split(SPLIT_CHAR).map(trim);
}

function parseFilter(str) {
  const filter = str.match(rgx);

  return filter
    ? {
        selector: str.slice(0, filter.index),
        key: filter[1],
        val: isDigit.test(filter[2]) ? parseInt(filter[2], 10) : filter[2],
      }
    : null;
}

module.exports = { parseSelector, parseFilter };
