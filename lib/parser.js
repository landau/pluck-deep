'use strict';

function invoke(fnName) {
  return function(v) {
    return v[fnName]();
  };
}

var trim = invoke('trim');
var SPLIT_CHAR = '.';
var rgx =/\[(.+)=(.+)\]/;
var isDigit = /^\d+$/;

exports.parseSelector = function (str) {
  return str.split(SPLIT_CHAR).map(trim);
};

exports.parseFilter = function (str) {
  var filter = str.match(rgx);

  // Nothing to filter
  if (!filter) {
    return null
  };

  return {
    selector: str.slice(0, filter.index),
    key: filter[1],
    val: isDigit.test(filter[2]) ? parseInt(filter[2], 10) : filter[2]
  };
};

