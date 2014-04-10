'use strict';

function invoke(fnName) {
  return function(v) {
    return v[fnName]();
  };
}

module.exports = function parser(str) {
  return str.split('.').map(invoke('trim'));
};

