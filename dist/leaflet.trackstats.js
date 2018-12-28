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
    return key in metadatas && (t === null || t in metadatas[key]);
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
  fetchAltitudes: function fetchAltitudes(latlngs, eventTarget) {
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
        promises.push(_this._fetchBatchAltitude(geometry.splice(0), eventTarget));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      promises.push(this._fetchBatchAltitude(geometry.splice(0), eventTarget));
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
  _fetchBatchAltitude: function _fetchBatchAltitude(geometry, eventTarget) {
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

          if (eventTarget) {
            eventTarget.fire('TrackStats:fetched', {
              datatype: 'altitudes',
              size: elevations.length
            });
          }

          resolve(elevations);
        },
        onFailure: function onFailure(error) {
          reject(new Error(error.message));
        }
      });
    });
  },
  fetchSlopes: function fetchSlopes(latlngs, eventTarget) {
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
          promises.push(_this3._fetchBatchSlope(x, y, batch, eventTarget));
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
  _fetchBatchSlope: function _fetchBatchSlope(tilex, tiley, coords, eventTarget) {
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

              if (eventTarget) {
                eventTarget.fire('TrackStats:fetched', {
                  datatype: 'slopes',
                  size: slopes.length
                });
              }

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

_dereq_('./stats.polyline');

_dereq_('./stats.trackdrawer');

var Stats = _dereq_('./stats');

var cache = _dereq_('./cache');

var Geoportail = _dereq_('./geoportail');

var Mapquest = _dereq_('./mapquest');

L.TrackStats = {
  cache: cache,
  Geoportail: Geoportail,
  Mapquest: Mapquest,
  Stats: Stats,
  geoportail: function geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  },
  mapquest: function mapquest(apiKey, map, options) {
    return new Mapquest(apiKey, map, options);
  }
};
module.exports = L.TrackStats;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache":2,"./geoportail":3,"./mapquest":5,"./stats":6,"./stats.polyline":7,"./stats.trackdrawer":8}],5:[function(_dereq_,module,exports){
(function (global){
"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var corslite = _dereq_('@mapbox/corslite');

module.exports = L.Class.extend({
  options: {},
  initialize: function initialize(apiKey, map, options) {
    this._apiKey = apiKey;
    this._map = map;
    L.Util.setOptions(this, options);
  },
  fetchAltitudes: function fetchAltitudes(latlngs, eventTarget) {
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
        promises.push(_this._fetchBatchAltitude(geometry.splice(0), eventTarget));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      promises.push(this._fetchBatchAltitude(geometry.splice(0), eventTarget));
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
  _fetchBatchAltitude: function _fetchBatchAltitude(geometry, eventTarget) {
    var latlngs = geometry.map(function (x) {
      return "".concat(x.lat, ",").concat(x.lon);
    }).join(',');
    var url = 'https://open.mapquestapi.com/elevation/v1/profile?shapeFormat=raw&' + "latLngCollection=".concat(latlngs, "&key=").concat(this._apiKey);
    return new Promise(function (resolve, reject) {
      corslite(url, function (err, resp) {
        if (!err) {
          try {
            var data = JSON.parse(resp.responseText);
            var elevations = [];
            var previous;
            var hasUndefinedValue = false;
            data.elevationProfile.forEach(function (val, i) {
              if (val.height === -32768) {
                // If no height data exists, API returns -32768
                // As an approximation, we'll use the previous value
                val.height = previous;
                if (previous === undefined) hasUndefinedValue = true;
              }

              elevations.push({
                lat: data.shapePoints[i * 2],
                lng: data.shapePoints[i * 2 + 1],
                z: val.height
              });
              previous = val.height;
            });

            if (hasUndefinedValue) {
              // If we're unlucky and no height data exists for the first point(s),
              // then we approximate to the next value
              for (var i = elevations.length - 1; i >= 0; i -= 1) {
                if (elevations[i].z === undefined) {
                  elevations[i].z = previous;
                }

                previous = elevations[i].z;
              }
            }

            if (eventTarget) {
              eventTarget.fire('TrackStats:fetched', {
                datatype: 'altitudes',
                size: elevations.length
              });
            }

            resolve(elevations);
          } catch (ex) {
            reject(ex);
          }
        } else {
          reject(new Error(err.response));
        }
      }, false);
    });
  },
  fetchSlopes: function fetchSlopes() {
    return new Promise(
    /*#__PURE__*/
    function () {
      var _ref2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(resolve, reject) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                reject(new Error('Unsupported'));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  }
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@mapbox/corslite":1}],6:[function(_dereq_,module,exports){
(function (global){
"use strict";

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var stats = L.Class.extend({
  options: {},
  initialize: function initialize(latlngs, options) {
    L.Util.setOptions(this, options);
    this.startingDistance = 0;
    this.distance = 0;
    this.altMin = Number.MAX_VALUE;
    this.altMax = Number.MIN_VALUE;
    this.heightDiffUp = 0;
    this.heightDiffDown = 0;
    this.slopeMin = Number.MAX_VALUE;
    this.slopeMax = Number.MIN_VALUE;
    this.slopeTerrainMin = Number.MAX_VALUE;
    this.slopeTerrainMax = Number.MIN_VALUE;
    this.latlngs = [];

    if (latlngs.length === 0) {
      return;
    }

    var elevations = JSON.parse(JSON.stringify(latlngs)); // deep copy

    this.altMin = elevations[0].z;
    this.altMax = elevations[0].z;
    this.slopeTerrainMin = elevations[0].slope;
    this.slopeTerrainMax = elevations[0].slope;
    elevations[0].dist = 0;
    elevations[0].slopeOnTrack = 0;
    this.latlngs.push(elevations[0]);
    var j = 0;

    for (var i = 1; i < elevations.length; i += 1) {
      var localDistance = L.latLng(elevations[i]).distanceTo(L.latLng(this.latlngs[j])); // m

      if (localDistance > 0) {
        this.distance += localDistance / 1000; // km

        j += 1;
        this.latlngs[j] = elevations[i];
        var current = this.latlngs[j];
        current.dist = this.distance;
        current.slopeOnTrack = Math.degrees(Math.atan((Math.round(this.latlngs[j].z) - Math.round(this.latlngs[j - 1].z)) / localDistance));
        if (current.z < this.altMin) this.altMin = current.z;
        if (current.z > this.altMax) this.altMax = current.z;
        if (current.slopeOnTrack < this.slopeMin) this.slopeMin = current.slopeOnTrack;
        if (current.slopeOnTrack > this.slopeMax) this.slopeMax = current.slopeOnTrack;

        if (current.z < this.latlngs[j - 1].z) {
          this.heightDiffDown += Math.round(this.latlngs[j - 1].z - current.z);
        } else {
          this.heightDiffUp += Math.round(current.z - this.latlngs[j - 1].z);
        }

        if (current.slope < this.slopeTerrainMin) this.slopeTerrainMin = current.slope;
        if (current.slope > this.slopeTerrainMax) this.slopeTerrainMax = current.slope;
      }
    }

    if (this.altMin === undefined) {
      this.heightDiffUp = undefined;
      this.heightDiffDown = undefined;
      this.slopeMax = undefined;
      this.slopeMin = undefined;
    }
  },
  accumulate: function accumulate(accumulator) {
    accumulator.latlngs = accumulator.latlngs.concat(this.getLatLngs().map(function (x) {
      x.dist += accumulator.distance;
      return x;
    }));
    accumulator.distance += this.distance;
    accumulator.altMin = Math.min(this.altMin, accumulator.altMin);
    accumulator.altMax = Math.max(this.altMax, accumulator.altMax);
    accumulator.heightDiffUp += this.heightDiffUp;
    accumulator.heightDiffDown += this.heightDiffDown;
    accumulator.slopeMin = Math.min(this.slopeMin, accumulator.slopeMin);
    accumulator.slopeMax = Math.max(this.slopeMax, accumulator.slopeMax);
    accumulator.slopeTerrainMin = Math.min(this.slopeTerrainMin, accumulator.slopeTerrainMin);
    accumulator.slopeTerrainMax = Math.max(this.slopeTerrainMax, accumulator.slopeTerrainMax);
    return this;
  },
  getLatLngs: function getLatLngs() {
    return JSON.parse(JSON.stringify(this.latlngs)); // deep copy
  },
  getDistance: function getDistance() {
    return this.distance;
  },
  getAltMin: function getAltMin() {
    return this.altMin;
  },
  getAltMax: function getAltMax() {
    return this.altMax;
  },
  getSlopeMin: function getSlopeMin() {
    return this.slopeMin;
  },
  getSlopeMax: function getSlopeMax() {
    return this.slopeMax;
  },
  getHeightDiffUp: function getHeightDiffUp() {
    return this.heightDiffUp;
  },
  getHeightDiffDown: function getHeightDiffDown() {
    return this.heightDiffDown;
  },
  getSlopeTerrainMin: function getSlopeTerrainMin() {
    return this.slopeTerrainMin;
  },
  getSlopeTerrainMax: function getSlopeTerrainMax() {
    return this.slopeTerrainMax;
  }
});
module.exports = stats;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(_dereq_,module,exports){
(function (global){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var cache = _dereq_('./cache');

var Stats = _dereq_('./stats');

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

L.Polyline.include({
  _stats: undefined,
  getStats: function getStats() {
    return this._stats;
  },
  fetchAltitude: function fetchAltitude(fetcher, eventTarget) {
    var latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(function (coords) {
      return !cache.hasZ(coords);
    });

    if (eventTarget && latlngs.length > 0) {
      eventTarget.fire('TrackStats:fetching', {
        datatype: 'altitudes',
        size: latlngs.length
      });
    }

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
                  _context.next = 7;
                  break;
                }

                _context.next = 4;
                return fetcher.fetchAltitudes(latlngs, eventTarget);

              case 4:
                elevations = _context.sent;
                elevations.forEach(function (x) {
                  return cache.addZ(x);
                });

                if (eventTarget) {
                  eventTarget.fire('TrackStats:done', {
                    datatype: 'altitudes',
                    size: elevations.length
                  });
                }

              case 7:
                resolve();
                _context.next = 13;
                break;

              case 10:
                _context.prev = 10;
                _context.t0 = _context["catch"](0);
                reject(_context.t0);

              case 13:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 10]]);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }());
  },
  fetchSlope: function fetchSlope(fetcher, eventTarget) {
    var latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(function (coords) {
      return !cache.hasSlope(coords);
    });

    if (eventTarget && latlngs.length > 0) {
      eventTarget.fire('TrackStats:fetching', {
        datatype: 'slopes',
        size: latlngs.length
      });
    }

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
                  _context2.next = 7;
                  break;
                }

                _context2.next = 4;
                return fetcher.fetchSlopes(latlngs, eventTarget);

              case 4:
                slopes = _context2.sent;
                slopes.forEach(function (x) {
                  return cache.addSlope(x);
                });

                if (eventTarget) {
                  eventTarget.fire('TrackStats:done', {
                    datatype: 'slopes',
                    size: slopes.length
                  });
                }

              case 7:
                resolve();
                _context2.next = 13;
                break;

              case 10:
                _context2.prev = 10;
                _context2.t0 = _context2["catch"](0);
                reject(_context2.t0);

              case 13:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[0, 10]]);
      }));

      return function (_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }());
  },
  fetchInfos: function fetchInfos(fetcher, eventTarget) {
    return Promise.all([this.fetchAltitude(fetcher, eventTarget), this.fetchSlope(fetcher, eventTarget)]);
  },
  computeStats: function computeStats() {
    var latlngs = getLatLngsFlatten(this).map(function (coords) {
      return coords.getCachedInfos();
    });
    this._stats = new Stats(latlngs);
    return this.getStats();
  }
});

L.LatLng.prototype.getCachedInfos = function getCachedInfos() {
  return cache.getAll(this);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./cache":2,"./stats":6}],8:[function(_dereq_,module,exports){
(function (global){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var Stats = _dereq_('./stats');

if (L.TrackDrawer !== undefined) {
  L.TrackDrawer.Track.include({
    _steps: undefined,
    _total: undefined,
    _i: 0,
    _bindEvent: function _bindEvent() {
      var _this = this;

      this.on('TrackDrawer:done', function () {
        _this._finalizeRoute(_this.options.fetcher);
      });
    },
    _finalizeRoute: function _finalizeRoute(fetcher) {
      var _this2 = this;

      var routes = [];
      this._i += 1;

      var currentNode = this._getNode(this._firstNodeId);

      this._nodesContainers.forEach(function () {
        do {
          var _this2$_getNext = _this2._getNext(currentNode),
              nextEdge = _this2$_getNext.nextEdge,
              nextNode = _this2$_getNext.nextNode;

          if (currentNode === undefined || nextEdge === undefined) {
            break;
          }

          routes.push(nextEdge);
          currentNode = nextNode;
        } while (currentNode.options.type !== 'stopover');
      });

      return new Promise(
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee(resolve, reject) {
          var promises;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  _context.prev = 0;
                  promises = [];
                  routes.forEach(function (r) {
                    promises.push(r.fetchInfos(fetcher, _this2).then(function () {
                      return r.computeStats();
                    }));
                  });
                  _context.next = 5;
                  return Promise.all(promises);

                case 5:
                  _this2._i -= 1;

                  if (_this2._i === 0) {
                    // Don't compute stats if this._i changed because the track is out-of-date
                    _this2._computeStats();
                  }

                  resolve();
                  _context.next = 14;
                  break;

                case 10:
                  _context.prev = 10;
                  _context.t0 = _context["catch"](0);
                  _this2._i -= 1;
                  reject(_context.t0);

                case 14:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee, this, [[0, 10]]);
        }));

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }());
    },
    getStatsTotal: function getStatsTotal() {
      return this._total;
    },
    getStatsSteps: function getStatsSteps() {
      return this._steps;
    },
    _computeStats: function _computeStats() {
      var _this3 = this;

      this._steps = [];
      this._total = new Stats([]);
      var local = new Stats([]);

      var currentNode = this._getNode(this._firstNodeId);

      this._nodesContainers.forEach(function (nodeContainer, idx) {
        currentNode._stats = {
          startingDistance: local.getDistance(),
          distance: _this3._total.getDistance(),
          z: currentNode.getLatLng().getCachedInfos().z
        };
        local = new Stats([]);
        local.startingDistance = _this3._total.getDistance();

        do {
          var _this3$_getNext = _this3._getNext(currentNode),
              nextEdge = _this3$_getNext.nextEdge,
              nextNode = _this3$_getNext.nextNode;

          if (currentNode === undefined || nextEdge === undefined) {
            break;
          }

          nextEdge.getStats().accumulate(_this3._total).accumulate(local);
          currentNode = nextNode;
          currentNode._stats = {
            startingDistance: local.getDistance(),
            distance: _this3._total.getDistance(),
            z: currentNode.getLatLng().getCachedInfos().z
          };
        } while (currentNode.options.type !== 'stopover');

        var edgeContainer = _this3._edgesContainers[idx];
        edgeContainer._stats = local;

        _this3._steps.push(local);
      });

      if (this._fireEvents) this.fire('TrackDrawer:statsdone', {});
      return this;
    }
  });
  L.TrackDrawer.Track.addInitHook('_bindEvent');
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./stats":6}]},{},[4]);
