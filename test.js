'use strict';

const assert = require('assert');
const { describe, it } = require('mocha');
const pluck = require('./lib/pluck');
const parser = require('./lib/parser');
const pluckDeep = require('.');

function prop(k) {
  return (o) => o[k];
}

describe('pluck', () => {
  it('should pluck values of an array', () => {
    const arr = [{ name: 'foo' }, { name: 'bar' }];
    const expect = ['foo', 'bar'];
    assert.deepEqual(pluck(arr, 'name'), expect);
  });

  it('should pluck values of an object', () => {
    const o = { name: 'foo' };
    const expect = 'foo';
    assert.deepEqual(pluck(o, 'name'), expect);
  });

  it('should return null if non array or object is given', () => {
    assert.deepEqual(pluck('hi', 'name'), null);
  });
});

describe('parse', () => {
  describe('#parseSelector', () => {
    it('should parse a string to an array', () => {
      const arr = parser.parseSelector('earth.mars');
      assert.equal(arr.length, 2);
      assert.deepEqual(arr, ['earth', 'mars']);
    });

    it('should trim whitespaces', () => {
      [
        parser.parseSelector('earth. mars'),
        parser.parseSelector('earth .mars'),
        parser.parseSelector('earth . mars'),
        parser.parseSelector(' earth . mars '),
      ].forEach((arr) => {
        assert.equal(arr.length, 2);
        assert.deepEqual(arr, ['earth', 'mars']);
      });
    });
  });

  describe('#parseFilter', () => {
    it('should return an object with selector/key/val', () => {
      const o = parser.parseFilter('saturn[awesome=true]');

      assert.equal(o.selector, 'saturn');
      assert.equal(o.key, 'awesome');
      assert.equal(o.val, 'true');
    });
  });
});

describe('#parseFilter should accept numbers', () => {
  it('should return an object with number selector/key/val', () => {
    const o = parser.parseFilter('saturn[gravity=3]');

    assert.equal(o.selector, 'saturn');
    assert.equal(o.key, 'gravity');
    assert.equal(o.val, 3);
  });
});

describe('pluckDeep', () => {
  it('should return a value for a non array', () => {
    const sel = 'planet';
    const o = { planet: 'mars' };
    const v = pluckDeep(o, sel);
    assert.equal(v, o.planet);
  });

  it('should return an array for a non array', () => {
    const sel = 'planet';
    const o = [{ planet: 'jupiter' }];
    const arr = pluckDeep(o, sel);
    assert(Array.isArray(arr));
  });

  it('should pluck a single value', () => {
    const sel = 'planet';
    const o = { planet: 'earth' };
    const v = pluckDeep(o, sel);
    assert.equal(v, o.planet);
  });

  it('should pluck a nested value', () => {
    const sel = 'mercury.venus';
    const o = {
      mercury: {
        venus: 'earth',
      },
    };

    const v = pluckDeep(o, sel);
    assert.equal(v, o.mercury.venus);
  });

  it('should pluck a nested values from an array', () => {
    const sel = 'saturn.moons.name';
    const o = {
      saturn: {
        moons: [{ name: 'titan' }, { name: 'enceladus' }, { name: 'rhea' }],
      },
    };

    const arr = pluckDeep(o, sel);
    const expect = o.saturn.moons.map(prop('name'));
    assert.deepEqual(arr, expect);
  });

  it('should return null for a non existant property', () => {
    const sel = 'saturn.moons.foo.nick';
    const o = {
      saturn: {
        moons: [{ name: 'titan' }, { name: 'enceladus' }, { name: 'rhea' }],
      },
    };

    const arr = pluckDeep(o, sel);
    assert.equal(arr, null);
  });

  it('should pluck into nested objects with arrays', () => {
    const sel = 'saturn.moons.position.lat';
    const o = {
      saturn: {
        moons: [
          {
            name: 'titan',
            position: {
              lat: 5,
              lon: 4,
            },
          },
          {
            name: 'rhea',
            position: {
              lat: 10,
              lon: 20,
            },
          },
        ],
      },
    };

    const arr = pluckDeep(o, sel);
    assert.deepEqual(arr, [5, 10]);
  });

  it('should pluck into nested objects with arrays using a number selector', () => {
    const sel = 'saturn.moons.position.lat[lon=4]';
    const o = {
      saturn: {
        moons: [
          {
            name: 'titan',
            position: {
              lat: 5,
              lon: 4,
            },
          },
          {
            name: 'rhea',
            position: {
              lat: 10,
              lon: 20,
            },
          },
        ],
      },
    };

    const arr = pluckDeep(o, sel);
    assert.deepEqual(arr, [5]);
  });

  it('should go pretty deep as a SANITY CHECK', () => {
    const sel =
      'sun.mercury.venus.earth.mars.jupiter.saturn.uranus.neptune.value';
    const solarSys = {
      sun: {
        mercury: {
          venus: {
            earth: {
              mars: {
                asteroids: [
                  { name: 'Ceres' },
                  { name: 'Vesta' },
                  { name: 'Pallas' },
                  { name: 'Hygiea' },
                ],
                jupiter: {
                  saturn: {
                    uranus: {
                      neptune: {
                        value: '<3',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const v = pluckDeep(solarSys, sel);
    assert.equal(v, '<3');

    const arr = pluckDeep(
      solarSys,
      'sun.mercury.venus.earth.mars.asteroids.name'
    );
    const aster = solarSys.sun.mercury.venus.earth.mars.asteroids.map(
      prop('name')
    );
    assert.deepEqual(arr, aster);
  });

  it('should accept filterables', () => {
    const sel = 'system.planets.name[type=dwarf]';
    const o = {
      system: {
        planets: [
          {
            name: 'earth',
            type: 'ocean',
          },
          {
            name: 'pluto',
            type: 'dwarf',
          },
        ],
      },
    };

    let v = pluckDeep(o, sel);
    assert(Array.isArray(v));
    assert.equal(v.length, 1);
    assert.equal(v[0], 'pluto');

    v = pluckDeep(o, 'system.planets.name[type=gas]');
    assert.equal(v, null);
  });

  it('should filter an object', () => {
    const sel = 'rings[type=gas]';
    const venus = {
      type: 'gas',
      rings: false,
    };

    let v = pluckDeep(venus, sel);
    assert.equal(v, false);

    v = pluckDeep(venus, 'rings[type=foo]');
    assert.equal(v, null);
  });
});
