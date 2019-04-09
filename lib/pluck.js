'use strict';

function prop(k) {
  return function valForProp(o) {
    return o[k];
  };
}

function isObj(o) {
  return o === Object(o);
}

module.exports = function pluck(o, k) {
  if (Array.isArray(o)) return o.map(prop(k));
  if (isObj(o)) return o[k]; // ok!
  return null;
};
