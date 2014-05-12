'use strict';

var assert = require('assert');
var pluck = require('./lib/pluck');
var parser = require('./lib/parser');
var pluckDeep = require('./');

function prop(k) {
  return function (o) {
    return o[k];
  };
}

describe('pluck', function() {
  it('should pluck values of an array', function() {
    var arr = [
      { name: 'foo' },
      { name: 'bar' }
    ];

    var expect = ['foo', 'bar'];

    assert.deepEqual(pluck(arr, 'name'), expect);
  });

  it('should pluck values of an object', function() {
    var o = {
      name: 'foo'
    };

    var expect = 'foo';

    assert.deepEqual(pluck(o, 'name'), expect);
  });
});

describe('parse', function() {
  describe('#parseSelector', function() {
    it('should parse a string to an array', function() {
      var arr = parser.parseSelector('earth.mars');
      assert.equal(arr.length, 2);
      assert.deepEqual(arr, ['earth', 'mars']);
    });

    it('should trim whitespaces', function() {
      [
        parser.parseSelector('earth. mars'),
        parser.parseSelector('earth .mars'),
        parser.parseSelector('earth . mars'),
        parser.parseSelector(' earth . mars ')
      ].forEach(function(arr) {
        assert.equal(arr.length, 2);
        assert.deepEqual(arr, ['earth', 'mars']);
      });
    });
  });

  describe('#parseFilter', function() {
    it('should return an object with selector/key/val', function() {
      var o = parser.parseFilter('saturn[awesome=true]');

      assert.equal(o.selector, 'saturn');
      assert.equal(o.key, 'awesome');
      assert.equal(o.val, 'true');
    });
  });
});

describe('pluckDeep', function() {
  it('should return a value for a non array', function() {
    var sel = 'planet';
    var o = { planet: 'mars' };
    var v = pluckDeep(o, sel);
    assert.equal(v, o.planet);
  });

  it('should return an array for a non array', function() {
    var sel = 'planet';
    var o = [{ planet: 'jupiter' }];
    var arr = pluckDeep(o, sel);
    assert(Array.isArray(arr));
  });

  it('should pluck a single value', function() {
    var sel = 'planet';
    var o = { planet: 'earth' };
    var v = pluckDeep(o, sel);
    assert.equal(v, o.planet);
  });

  it('should pluck a nested value', function() {
    var sel = 'mercury.venus';
    var o = {
      mercury: {
        venus: 'earth'
      }
    };

    var v = pluckDeep(o, sel);
    assert.equal(v, o.mercury.venus);
  });

  it('should pluck a nested values from an array', function() {
    var sel = 'saturn.moons.name';
    var o = {
      saturn: {
        moons: [
          { name: 'titan' },
          { name: 'enceladus' },
          { name: 'rhea' }
        ]
      }
    };

    var arr = pluckDeep(o, sel);
    var expect = o.saturn.moons.map(prop('name'));
    assert.deepEqual(arr, expect);
  });

  it('should return null for a non existant property', function() {
    var sel = 'saturn.moons.foo.nick';
    var o = {
      saturn: {
        moons: [
          { name: 'titan' },
          { name: 'enceladus' },
          { name: 'rhea' }
        ]
      }
    };

    var arr = pluckDeep(o, sel);
    assert.equal(arr, null);
  });

  it('should pluck into nested objects with arrays', function() {
    var sel = 'saturn.moons.position.lat';
    var o = {
      saturn: {
        moons: [
          {
            name: 'titan',
            position: {
              lat: 5,
              lon: 4
            }
          },
          {
            name: 'rhea',
            position: {
              lat: 10,
              lon: 20
            }
          },
        ]
      }
    };

    var arr = pluckDeep(o, sel);
    assert.deepEqual(arr, [5, 10]);
  });

  it('should go pretty deep as a SANITY CHECK', function() {
    var sel = 'sun.mercury.venus.earth.mars.jupiter.saturn.uranus.neptune.value';
    var solarSys = {
      sun: {
        mercury: {
          venus: {
            earth: {
              mars: {
                asteroids: [
                  { name: 'Ceres' },
                  { name: 'Vesta' },
                  { name: 'Pallas' },
                  { name: 'Hygiea' }
                ],
                jupiter: {
                  saturn: {
                    uranus: {
                      neptune: {
                        value: '<3'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    var v = pluckDeep(solarSys, sel);
    assert.equal(v, '<3');

    var arr = pluckDeep(solarSys, 'sun.mercury.venus.earth.mars.asteroids.name');
    var aster = solarSys.sun.mercury.venus.earth.mars.asteroids.map(prop('name'));
    assert.deepEqual(arr, aster);
  });

  it('should accept filterables', function() {
    var sel = 'system.planets.name[type=dwarf]';
    var o = {
      system: {
        planets: [
          {
            name: 'earth',
            type: 'ocean',
          },
          {
            name: 'pluto',
            type: 'dwarf',
          }
        ]
      }
    };

    var v = pluckDeep(o, sel);
    assert(Array.isArray(v));
    assert.equal(v.length, 1);
    assert.equal(v[0], 'pluto');

    v = pluckDeep(o, 'system.planets.name[type=gas]');
    assert.equal(v, null);
  });

  it('should filter an object', function() {
    var sel = 'rings[type=gas]';
    var venus = {
      type: 'gas',
      rings: false
    };

    var v = pluckDeep(venus, sel);
    assert.equal(v, false);

    v = pluckDeep(venus, 'rings[type=foo]');
    assert.equal(v, null);
  });
});
