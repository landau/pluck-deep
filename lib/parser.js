'use strict';

function invoke(fnName) {
  return function(v) {
    return v[fnName]();
  };
}

exports.parseSelector = function (str) {
  return str.split('.').map(invoke('trim'));
};

exports.parseFilter = function (str) {
  var idx = str.indexOf('[');

  // Nothing to filter
  if (!~idx) return null;

  // trim off brackets and split
  var filter = str.slice(idx + 1, str.length - 1).split('=');

  return {
    selector: str.slice(0, idx),
    key: filter[0],
    val: filter[1]
  };
};

