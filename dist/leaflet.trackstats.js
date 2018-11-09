(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(_dereq_,module,exports){
"use strict";

var metadatas = {}; // Rounds to 8 decimals (IGN API does not support/give more precise data)

if (typeof Math.roundE8 === 'undefined') {
  Math.roundE8 = function roundE8(value) {
    return Math.round(value * 100000000) / 100000000;
  };
}

function getKeyLatLng(lat, lng) {
  return "".concat(Math.roundE8(lng), "/").concat(Math.roundE8(lat));
}

function getKey(coords) {
  return getKeyLatLng(coords.lat, coords.lng);
}

module.exports = {
  add: function add(t, coords) {
    var key = getKey(coords);
    if (!(key in metadatas)) metadatas[key] = {};
    metadatas[key][t] = coords[t];
    return this;
  },
  get: function get(t, coords) {
    var key = getKey(coords);
    return key in metadatas && t in metadatas[key] ? metadatas[key][t] : undefined;
  },
  has: function has(t, coords) {
    var key = getKey(coords);
    return key in metadatas && t in metadatas[key];
  },
  hasZ: function hasZ(coords) {
    return this.has('z', coords);
  },
  hasSlope: function hasSlope(coords) {
    return this.has('slope', coords);
  },
  addZ: function addZ(coords) {
    this.add('z', coords);
    return this;
  },
  addSlope: function addSlope(coords) {
    this.add('slope', coords);
    return this;
  },
  getAll: function getAll(coords) {
    var key = getKey(coords);
    var md = key in metadatas ? metadatas[key] : {};
    return {
      lat: coords.lat,
      lng: coords.lng,
      z: 'z' in md ? md.z : undefined,
      slope: 'slope' in md ? md.slope : undefined
    };
  },
  clear: function clear() {
    Object.keys(metadatas).forEach(function (x) {
      return delete metadatas[x];
    });
    return this;
  }
};

},{}],3:[function(_dereq_,module,exports){
(function (global){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Gp = (typeof window !== "undefined" ? window['Gp'] : typeof global !== "undefined" ? global['Gp'] : null);

var corslite = _dereq_('@mapbox/corslite');

function latLngToTilePixel(latlng, crs, zoom, tileSize, pixelOrigin) {
  var layerPoint = crs.latLngToPoint(latlng, zoom).floor();
  var tile = layerPoint.divideBy(tileSize).floor();
  var tileCorner = tile.multiplyBy(tileSize).subtract(pixelOrigin);
  var tilePixel = layerPoint.subtract(pixelOrigin).subtract(tileCorner);
  return {
    tile: tile,
    tilePixel: tilePixel
  };
}

module.exports = L.Class.extend({
  options: {},
  initialize: function initialize(apiKey, map, options) {
    this._apiKey = apiKey;
    this._map = map;
    L.Util.setOptions(this, options);
  },
  fetchAltitudes: function fetchAltitudes(latlngs) {
    var _this = this;

    var geometry = [];
    var promises = [];
    latlngs.forEach(function (coords) {
      geometry.push({
        lon: coords.lng,
        lat: coords.lat
      });

      if (geometry.length === 50) {
        // Launch batch
        promises.push(_this._fetchBatchAltitude(geometry.splice(0)));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      promises.push(this._fetchBatchAltitude(geometry.splice(0)));
    }

    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(resolve, reject) {
        var data, results;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return Promise.all(promises);

              case 3:
                data = _context.sent;
                results = [];
                data.forEach(function (x) {
                  return results.push.apply(results, _toConsumableArray(x));
                });
                resolve(results);
                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                reject(_context.t0);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  _fetchBatchAltitude: function _fetchBatchAltitude(geometry) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      Gp.Services.getAltitude({
        apiKey: _this2._apiKey,
        sampling: geometry.length,
        positions: geometry,
        onSuccess: function onSuccess(result) {
          var elevations = [];
          result.elevations.forEach(function (val) {
            elevations.push({
              lat: val.lat,
              lng: val.lon,
              z: val.z
            });
          });
          resolve(elevations);
        },
        onFailure: function onFailure(error) {
          reject(new Error(error.message));
        }
      });
    });
  },
  fetchSlopes: function fetchSlopes(latlngs) {
    var _this3 = this;

    var tiles = {};
    var promises = [];
    var crs = this._map ? this._map.options.crs : this.options.crs || L.CRS.EPSG3857;
    var pixelOrigin = this._map ? this._map.getPixelOrigin() : this.options.pixelOrigin;
    latlngs.forEach(function (coords) {
      var _latLngToTilePixel = latLngToTilePixel(coords, crs, 16, 256, pixelOrigin),
          tile = _latLngToTilePixel.tile,
          tilePixel = _latLngToTilePixel.tilePixel;

      if (!(tile.x in tiles)) tiles[tile.x] = {};
      if (!(tile.y in tiles[tile.x])) tiles[tile.x][tile.y] = [[]];
      var arr = tiles[tile.x][tile.y];
      if (arr[arr.length - 1].length > 50) arr.push([]);
      arr[arr.length - 1].push({
        lat: coords.lat,
        lng: coords.lng,
        x: tilePixel.x,
        y: tilePixel.y
      });
    });
    Object.keys(tiles).forEach(function (x) {
      Object.keys(tiles[x]).forEach(function (y) {
        tiles[x][y].forEach(function (batch) {
          promises.push(_this3._fetchBatchSlope(x, y, batch));
        });
      });
    });
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(resolve, reject) {
        var data, results;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;
                _context2.next = 3;
                return Promise.all(promises);

              case 3:
                data = _context2.sent;
                results = [];
                data.forEach(function (x) {
                  return results.push.apply(results, _toConsumableArray(x));
                });
                resolve(results);
                _context2.next = 12;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);
                reject(_context2.t0);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  },
  _fetchBatchSlope: function _fetchBatchSlope(tilex, tiley, coords) {
    var tilematrix = 16;
    var tilerow = tiley;
    var tilecol = tilex;
    var lon = '';
    var lat = '';
    var x = '';
    var y = '';
    var apikey = this._apiKey;
    coords.forEach(function (coord, idx) {
      if (idx > 0) {
        lon += '|';
        lat += '|';
        x += '|';
        y += '|';
      }

      lon += coord.lng.toString();
      lat += coord.lat.toString();
      x += coord.x.toString();
      y += coord.y.toString();
    });
    var url = "slope.php?tilematrix=".concat(tilematrix, "&tilerow=").concat(tilerow, "&tilecol=").concat(tilecol) + "&lon=".concat(lon, "&lat=").concat(lat, "&x=").concat(x, "&y=").concat(y, "&apikey=").concat(apikey);
    return new Promise(function (resolve, reject) {
      corslite(url, function (err, resp) {
        if (!err) {
          try {
            var data = JSON.parse(resp.responseText);

            if (data.results) {
              var slopes = [];
              data.results.forEach(function (val) {
                slopes.push({
                  lat: val.lat,
                  lng: val.lon,
                  slope: val.slope
                });
              });
              resolve(slopes);
            } else {
              reject(new Error("Impossible d'obtenir les données de pentes: résultats invalides"));
            }
          } catch (ex) {
            reject(ex);
          }
        } else {
          try {
            var _data = JSON.parse(err.responseText);

            reject(new Error(_data.error));
          } catch (ex) {
            reject(ex);
          }
        }
      }, false);
    });
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@mapbox/corslite":1}],4:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

_dereq_('./stats');

var cache = _dereq_('./cache');

var Geoportail = _dereq_('./geoportail');

L.TrackStats = {
  cache: cache,
  Geoportail: Geoportail,
  geoportail: function geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  }
};
module.exports = L.TrackStats;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache":2,"./geoportail":3,"./stats":5}],5:[function(_dereq_,module,exports){
(function (global){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var cache = _dereq_('./cache');

if (typeof Math.degrees === 'undefined') {
  // Converts from radians to degrees.
  Math.degrees = function degrees(radians) {
    return radians * 180 / Math.PI;
  };
}

function getLatLngsFlatten(polyline) {
  var latlngs = polyline.getLatLngs();

  if (latlngs.length > 0 && Array.isArray(latlngs[0])) {
    var result = [];

    for (var j = 0; j < latlngs.length; j += 1) {
      result = result.concat(latlngs[j]);
    }

    return result;
  }

  return latlngs;
}

function computePathStats(polyline) {
  var latlngs = getLatLngsFlatten(polyline);
  var elevations = latlngs.map(function (coords) {
    return coords.getCachedInfos();
  });

  if (elevations.length === 0) {
    return null;
  }

  var results = {
    distance: 0,
    altMin: elevations[0].z,
    altMax: elevations[0].z,
    heightDiffUp: 0,
    heightDiffDown: 0,
    slopeMin: Number.MAX_VALUE,
    slopeMax: Number.MIN_VALUE,
    slopeTerrainMin: elevations[0].slope,
    slopeTerrainMax: elevations[0].slope,
    elevations: []
  };
  elevations[0].dist = 0;
  elevations[0].slopeOnTrack = 0;
  results.elevations.push(elevations[0]);
  var j = 0;

  for (var i = 1; i < elevations.length; i += 1) {
    var localDistance = L.latLng(elevations[i]).distanceTo(L.latLng(results.elevations[j])); // m

    if (localDistance > 0) {
      results.distance += localDistance / 1000; // km

      j += 1;
      results.elevations[j] = elevations[i];
      results.elevations[j].dist = results.distance;
      results.elevations[j].slopeOnTrack = Math.degrees(Math.atan((Math.round(results.elevations[j].z) - Math.round(results.elevations[j - 1].z)) / localDistance));
      if (results.elevations[j].z < results.altMin) results.altMin = results.elevations[j].z;
      if (results.elevations[j].z > results.altMax) results.altMax = results.elevations[j].z;
      if (results.elevations[j].slopeOnTrack < results.slopeMin) results.slopeMin = results.elevations[j].slopeOnTrack;
      if (results.elevations[j].slopeOnTrack > results.slopeMax) results.slopeMax = results.elevations[j].slopeOnTrack;

      if (results.elevations[j].z < results.elevations[j - 1].z) {
        results.heightDiffDown += Math.round(results.elevations[j - 1].z - results.elevations[j].z);
      } else {
        results.heightDiffUp += Math.round(results.elevations[j].z - results.elevations[j - 1].z);
      }

      if (results.elevations[j].slope < results.slopeTerrainMin) results.slopeTerrainMin = results.elevations[j].slope;
      if (results.elevations[j].slope > results.slopeTerrainMax) results.slopeTerrainMax = results.elevations[j].slope;
    }
  }

  if (results.altMin === undefined) {
    results.heightDiffUp = undefined;
    results.heightDiffDown = undefined;
    results.slopeMax = undefined;
    results.slopeMin = undefined;
  }

  return results;
}

L.Polyline.include({
  _elevations: [],
  _distance: 0,
  _altMin: 0,
  _altMax: 0,
  _slopeMin: 0,
  _slopeMax: 0,
  _heightDiffUp: 0,
  _heightDiffDown: 0,
  _slopeTerrainMin: 0,
  _slopeTerrainMax: 0,
  getElevations: function getElevations() {
    return JSON.parse(JSON.stringify(this._elevations)); // deep copy
  },
  getDistance: function getDistance() {
    return this._distance;
  },
  getAltMin: function getAltMin() {
    return this._altMin;
  },
  getAltMax: function getAltMax() {
    return this._altMax;
  },
  getSlopeMin: function getSlopeMin() {
    return this._slopeMin;
  },
  getSlopeMax: function getSlopeMax() {
    return this._slopeMax;
  },
  getHeightDiffUp: function getHeightDiffUp() {
    return this._heightDiffUp;
  },
  getHeightDiffDown: function getHeightDiffDown() {
    return this._heightDiffDown;
  },
  getSlopeTerrainMin: function getSlopeTerrainMin() {
    return this._slopeTerrainMin;
  },
  getSlopeTerrainMax: function getSlopeTerrainMax() {
    return this._slopeTerrainMax;
  },
  fetchAltitude: function fetchAltitude(fetcher) {
    var latlngs = Array.from(new Set(getLatLngsFlatten(this).filter(function (coords) {
      return !cache.hasZ(coords);
    })));
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(resolve, reject) {
        var elevations;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;

                if (!(latlngs.length > 0)) {
                  _context.next = 6;
                  break;
                }

                _context.next = 4;
                return fetcher.fetchAltitudes(latlngs);

              case 4:
                elevations = _context.sent;
                elevations.forEach(function (x) {
                  return cache.addZ(x);
                });

              case 6:
                resolve();
                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context["catch"](0);
                reject(_context.t0);

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 9]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  fetchSlope: function fetchSlope(fetcher) {
    var latlngs = Array.from(new Set(getLatLngsFlatten(this).filter(function (coords) {
      return !cache.hasSlope(coords);
    })));
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(resolve, reject) {
        var slopes;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.prev = 0;

                if (!(latlngs.length > 0)) {
                  _context2.next = 6;
                  break;
                }

                _context2.next = 4;
                return fetcher.fetchSlopes(latlngs);

              case 4:
                slopes = _context2.sent;
                slopes.forEach(function (x) {
                  return cache.addSlope(x);
                });

              case 6:
                resolve();
                _context2.next = 12;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](0);
                reject(_context2.t0);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 9]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  },
  fetchInfos: function fetchInfos(fetcher) {
    var _this = this;

    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(resolve, reject) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return _this.fetchAltitude(fetcher);

              case 3:
                _context3.next = 5;
                return _this.fetchSlope(fetcher);

              case 5:
                resolve();
                _context3.next = 11;
                break;

              case 8:
                _context3.prev = 8;
                _context3.t0 = _context3["catch"](0);
                reject(_context3.t0);

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this, [[0, 8]]);
      }));

      return function (_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }());
  },
  computeStats: function computeStats() {
    var results = computePathStats(this);

    if (results === null) {
      return false;
    }

    this._elevations = results.elevations;
    this._distance = results.distance;
    this._altMin = results.altMin;
    this._altMax = results.altMax;
    this._slopeMin = results.slopeMin;
    this._slopeMax = results.slopeMax;
    this._heightDiffUp = results.heightDiffUp;
    this._heightDiffDown = results.heightDiffDown;
    this._slopeTerrainMin = results.slopeTerrainMin;
    this._slopeTerrainMax = results.slopeTerrainMax;
    return true;
  }
});

L.LatLng.prototype.getCachedInfos = function getCachedInfos() {
  return cache.getAll(this);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache":2}]},{},[4]);
