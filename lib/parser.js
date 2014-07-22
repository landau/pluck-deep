'use strict';

function invoke(fnName) {
  return function(v) {
    return v[fnName]();
  };
}

exports.parseSelector = function (str) {
  return str.split('.').map(invoke('trim'));
};


var rgx =/\[(.+)=(.+)\]/;
exports.parseFilter = function (str) {
  var filter = str.match(rgx);

  // Nothing to filter
  if (!filter) return null;

  return {
    selector: str.slice(0, filter.index),
    key: filter[1],
    val: /^\d+$/.test(filter[2]) ? parseInt(filter[2]) : filter[2]
  };
};

