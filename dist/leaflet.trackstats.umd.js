(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('leaflet'), require('geoportal-access-lib'), require('@mapbox/corslite'), require('promise-queue')) :
  typeof define === 'function' && define.amd ? define(['leaflet', 'geoportal-access-lib', '@mapbox/corslite', 'promise-queue'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.leaflet_trackstats_uncompressed = factory(global.L, global.Gp, global.corslite, global.Queue));
}(this, (function (L, Gp, corslite, Queue) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var L__default = /*#__PURE__*/_interopDefaultLegacy(L);
  var Gp__default = /*#__PURE__*/_interopDefaultLegacy(Gp);
  var corslite__default = /*#__PURE__*/_interopDefaultLegacy(corslite);
  var Queue__default = /*#__PURE__*/_interopDefaultLegacy(Queue);

  var metadatas = {};
  var precision = 8; // Rounds to X decimals (IGN API supports up to 8, MapQuest up to 5)

  if (typeof Math.roundE === 'undefined') {
    Math.roundE = function roundE(value, decimals) {
      var pow = Math.pow(10, decimals);
      return Math.round(value * pow) / pow;
    };
  }

  function getKeyLatLng(lat, lng, decimals) {
    return "".concat(Math.roundE(lng, decimals), "/").concat(Math.roundE(lat, decimals));
  }

  function getKey(coords, decimals) {
    return getKeyLatLng(coords.lat, coords.lng, decimals);
  }

  var cache = {
    setPrecision: function setPrecision(p) {
      precision = p;
      return this;
    },
    add: function add(t, coords) {
      var key = getKey(coords, precision);
      if (!(key in metadatas)) metadatas[key] = {};
      metadatas[key][t] = coords[t];
      return this;
    },
    get: function get(t, coords) {
      var key = getKey(coords, precision);
      return key in metadatas && t in metadatas[key] ? metadatas[key][t] : undefined;
    },
    has: function has(t, coords) {
      var key = getKey(coords, precision);
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
      var key = getKey(coords, precision);
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

  var stats = L__default['default'].Class.extend({
    options: {},
    initialize: function initialize(latlngs, options) {
      L__default['default'].Util.setOptions(this, options);
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
        var localDistance = L__default['default'].latLng(elevations[i]).distanceTo(L__default['default'].latLng(this.latlngs[j])); // m

        if (localDistance > 0) {
          this.distance += localDistance / 1000; // km

          j += 1;
          this.latlngs[j] = elevations[i];
          var current = this.latlngs[j];
          current.dist = this.distance;

          if (current.z) {
            if (current.z < this.altMin) this.altMin = current.z;
            if (current.z > this.altMax) this.altMax = current.z;
            var altDiff = current.z - this.latlngs[j - 1].z;

            if (altDiff < 0) {
              this.heightDiffDown += Math.round(-altDiff);
            } else if (altDiff > 0) {
              this.heightDiffUp += Math.round(altDiff);
            } // else can happen if some data is missing, we choose to ignore it


            current.slopeOnTrack = Math.round(Math.degrees(Math.atan(altDiff / localDistance)));
          } else {
            current.slopeOnTrack = 0;
          }

          if (current.slope) {
            if (current.slope < this.slopeTerrainMin) this.slopeTerrainMin = current.slope;
            if (current.slope > this.slopeTerrainMax) this.slopeTerrainMax = current.slope;
          }
        }
      }

      var size = this.latlngs.length;

      for (var _i = 0; _i < size; _i += 1) {
        if (_i > 3 && _i < size - 4) {
          this.latlngs[_i].slopeOnTrack = (this.latlngs[_i - 3].slopeOnTrack + 2 * this.latlngs[_i - 2].slopeOnTrack + 4 * this.latlngs[_i - 1].slopeOnTrack + 8 * this.latlngs[_i].slopeOnTrack + 4 * this.latlngs[_i + 1].slopeOnTrack + 2 * this.latlngs[_i + 2].slopeOnTrack + this.latlngs[_i + 3].slopeOnTrack) / 22;
          if (this.latlngs[_i].slopeOnTrack < this.slopeMin) this.slopeMin = this.latlngs[_i].slopeOnTrack;
          if (this.latlngs[_i].slopeOnTrack > this.slopeMax) this.slopeMax = this.latlngs[_i].slopeOnTrack;
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
  var stats_1 = stats;

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

  L__default['default'].Polyline.include({
    _stats: undefined,
    getStats: function getStats() {
      return this._stats;
    },
    fetchAltitude: function fetchAltitude(fetcher, eventTarget) {
      if (!('altitudes' in fetcher.features) || !fetcher.features.altitudes) {
        return new Promise(function (_resolve, reject) {
          return reject(new Error('Unsupported'));
        });
      }

      cache.setPrecision(fetcher.precision);
      var latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(function (coords) {
        return !cache.hasZ(coords);
      });

      if (latlngs.length === 0) {
        return new Promise(function (resolve) {
          return resolve();
        });
      }

      if (eventTarget) {
        eventTarget.fire('TrackStats:fetching', {
          datatype: 'altitudes',
          size: latlngs.length
        });
      }

      return new Promise(function (resolve, reject) {
        fetcher.fetchAltitudes(latlngs, eventTarget).then(function (elevations) {
          elevations.forEach(function (x) {
            return cache.addZ(x);
          });

          if (eventTarget) {
            eventTarget.fire('TrackStats:done', {
              datatype: 'altitudes',
              size: elevations.length
            });
          }

          resolve();
        })["catch"](function (e) {
          return reject(e);
        });
      });
    },
    fetchSlope: function fetchSlope(fetcher, eventTarget) {
      if (!('slopes' in fetcher.features) || !fetcher.features.slopes) {
        return new Promise(function (_resolve, reject) {
          return reject(new Error('Unsupported'));
        });
      }

      cache.setPrecision(fetcher.precision);
      var latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(function (coords) {
        return !cache.hasSlope(coords);
      });

      if (latlngs.length === 0) {
        return new Promise(function (resolve) {
          return resolve();
        });
      }

      if (eventTarget) {
        eventTarget.fire('TrackStats:fetching', {
          datatype: 'slopes',
          size: latlngs.length
        });
      }

      return new Promise(function (resolve, reject) {
        fetcher.fetchSlopes(latlngs, eventTarget).then(function (slopes) {
          slopes.forEach(function (x) {
            return cache.addSlope(x);
          });

          if (eventTarget) {
            eventTarget.fire('TrackStats:done', {
              datatype: 'slopes',
              size: slopes.length
            });
          }

          resolve();
        })["catch"](function (e) {
          return reject(e);
        });
      });
    },
    fetchInfos: function fetchInfos(fetcher, eventTarget) {
      var promises = [];

      if ('altitudes' in fetcher.features && fetcher.features.altitudes) {
        promises.push(this.fetchAltitude(fetcher, eventTarget));
      }

      if ('slopes' in fetcher.features && fetcher.features.slopes) {
        promises.push(this.fetchSlope(fetcher, eventTarget));
      }

      return Promise.all(promises);
    },
    computeStats: function computeStats() {
      var latlngs = getLatLngsFlatten(this).map(function (coords) {
        return coords.getCachedInfos();
      });
      this._stats = new stats_1(latlngs);
      return this.getStats();
    }
  });

  L__default['default'].LatLng.prototype.getCachedInfos = function getCachedInfos() {
    return cache.getAll(this);
  };

  if (L__default['default'].TrackDrawer !== undefined) {
    L__default['default'].TrackDrawer.Track.include({
      _steps: undefined,
      _total: undefined,
      _i: 0,
      _bindEvent: function _bindEvent() {
        var _this = this;

        this.on('TrackDrawer:start', function () {
          _this._i += 1;
        });
        this.on('TrackDrawer:failed', function (e) {
          _this._i -= 1;
          if (_this._fireEvents) _this.fire('TrackDrawer:statsfailed', {
            message: e.message
          });
        });
        this.on('TrackDrawer:done', function () {
          _this._finalizeRoute(_this.options.fetcher)["catch"](function (e) {
            _this._i -= 1;
            if (_this._fireEvents) _this.fire('TrackDrawer:statsfailed', {
              message: e.message
            });
          });
        });
      },
      _finalizeRoute: function _finalizeRoute(fetcher) {
        var _this2 = this;

        var routes = [];

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

        return new Promise(function (resolve, reject) {
          var promises = [];
          routes.forEach(function (r) {
            promises.push(r.fetchInfos(fetcher, _this2).then(function () {
              return r.computeStats();
            }));
          });
          Promise.all(promises).then(function () {
            _this2._i -= 1;

            if (_this2._i === 0) {
              // Compute stats only if this._i is back to 0 (otherwise the track is out-of-date)
              _this2._computeStats();
            }

            resolve();
          })["catch"](function (e) {
            return reject(e);
          });
        });
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
        this._total = new stats_1([]);
        var local = new stats_1([]);

        var currentNode = this._getNode(this._firstNodeId);

        if (currentNode !== undefined) {
          this._nodesContainers.forEach(function (nodeContainer, idx) {
            currentNode._stats = {
              startingDistance: local.getDistance(),
              distance: _this3._total.getDistance(),
              z: currentNode.getLatLng().getCachedInfos().z
            };
            local = new stats_1([]);
            local.startingDistance = _this3._total.getDistance();

            do {
              var _this3$_getNext = _this3._getNext(currentNode),
                  nextEdge = _this3$_getNext.nextEdge,
                  nextNode = _this3$_getNext.nextNode;

              if (currentNode === undefined || nextEdge === undefined) {
                break;
              }

              var stats = nextEdge.getStats();

              if (stats !== undefined) {
                stats.accumulate(_this3._total).accumulate(local);
              }

              currentNode = nextNode;
              currentNode._stats = {
                startingDistance: local.getDistance(),
                distance: _this3._total.getDistance(),
                z: currentNode.getLatLng().getCachedInfos().z
              };
            } while (currentNode.options.type !== 'stopover');

            var edgeContainer = _this3._edgesContainers.get(idx);

            edgeContainer._stats = local;

            _this3._steps.push(local);
          });
        }

        if (this._fireEvents) this.fire('TrackDrawer:statsdone', {});
        return this;
      }
    });
    L__default['default'].TrackDrawer.Track.addInitHook('_bindEvent');
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }

  var arrayLikeToArray = _arrayLikeToArray;

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return arrayLikeToArray(arr);
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
  }

  var unsupportedIterableToArray = _unsupportedIterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

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

  var geoportail = L__default['default'].Class.extend({
    options: {
      queueConcurrency: 5
    },
    initialize: function initialize(apiKey, map, options) {
      this._apiKey = apiKey;
      this._map = map;
      this.features = {
        altitudes: true,
        slopes: true
      };
      this.precision = 8;
      L__default['default'].Util.setOptions(this, options);
      this._queue = new Queue__default['default'](this.options.queueConcurrency, Infinity);
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
          var g = geometry.splice(0);
          promises.push(_this._queue.add(function () {
            return _this._fetchBatchAltitude(g, eventTarget);
          }));
        }
      });

      if (geometry.length > 0) {
        // Launch last batch
        var g = geometry.splice(0);
        promises.push(this._queue.add(function () {
          return _this._fetchBatchAltitude(g, eventTarget);
        }));
      }

      return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function (data) {
          var results = [];
          data.forEach(function (x) {
            return results.push.apply(results, toConsumableArray(x));
          });
          resolve(results);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    },
    _doFetchBatchAltitude: function _doFetchBatchAltitude(geometry, eventTarget, resolve, reject, retry) {
      var _this2 = this;

      Gp__default['default'].Services.getAltitude({
        apiKey: this._apiKey,
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
          if (retry) {
            _this2._doFetchBatchAltitude(geometry, eventTarget, resolve, reject, false);
          } else {
            reject(new Error(error.message));
          }
        }
      });
    },
    _fetchBatchAltitude: function _fetchBatchAltitude(geometry, eventTarget) {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3._doFetchBatchAltitude(geometry, eventTarget, resolve, reject, true);
      });
    },
    fetchSlopes: function fetchSlopes(latlngs, eventTarget) {
      var _this4 = this;

      var tiles = {};
      var promises = [];
      var crs = this._map ? this._map.options.crs : this.options.crs || L__default['default'].CRS.EPSG3857;
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
            promises.push(_this4._queue.add(function () {
              return _this4._fetchBatchSlope(x, y, batch, eventTarget);
            }));
          });
        });
      });
      return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function (data) {
          var results = [];
          data.forEach(function (x) {
            return results.push.apply(results, toConsumableArray(x));
          });
          resolve(results);
        })["catch"](function (e) {
          return reject(e);
        });
      });
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
        corslite__default['default'](url, function (err, resp) {
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

  function createCommonjsModule(fn, basedir, module) {
  	return module = {
  		path: basedir,
  		exports: {},
  		require: function (path, base) {
  			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
  		}
  	}, fn(module, module.exports), module.exports;
  }

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
  }

  var runtime_1 = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    define(Gp, toStringTagSymbol, "Generator");

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function() {
      return this;
    };

    Gp.toString = function() {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
     module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    Function("r", "regeneratorRuntime = r")(runtime);
  }
  });

  var regenerator = runtime_1;

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  var asyncToGenerator = _asyncToGenerator;

  var openelevation = L__default['default'].Class.extend({
    options: {
      server: 'https://api.open-elevation.com/api',
      queueConcurrency: 1
    },
    initialize: function initialize(map, options) {
      this._map = map;
      this.features = {
        altitudes: true,
        slopes: false
      };
      this.precision = 6;
      L__default['default'].Util.setOptions(this, options);
      this._queue = new Queue__default['default'](this.options.queueConcurrency, Infinity);
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

        if (geometry.length === 1000) {
          // Launch batch
          var g = geometry.splice(0);
          promises.push(_this._queue.add(function () {
            return _this._fetchBatchAltitude(g, eventTarget);
          }));
        }
      });

      if (geometry.length > 0) {
        // Launch last batch
        var g = geometry.splice(0);
        promises.push(this._queue.add(function () {
          return _this._fetchBatchAltitude(g, eventTarget);
        }));
      }

      return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function (data) {
          var results = [];
          data.forEach(function (x) {
            return results.push.apply(results, toConsumableArray(x));
          });
          resolve(results);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    },
    _fetchBatchAltitude: function _fetchBatchAltitude(geometry, eventTarget) {
      var latlngs = geometry.map(function (x) {
        return {
          latitude: x.lat,
          longitude: x.lon
        };
      });
      var url = "".concat(this.options.server, "/v1/lookup");
      return window.fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locations: latlngs
        })
      }).then( /*#__PURE__*/function () {
        var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(response) {
          var contentType, data, elevations, previous, hasUndefinedValue, i;
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  contentType = response.headers.get('content-type');

                  if (!(!contentType || contentType.indexOf('application/json') === -1)) {
                    _context.next = 3;
                    break;
                  }

                  throw new Error('Error: invalid response');

                case 3:
                  _context.next = 5;
                  return response.json();

                case 5:
                  data = _context.sent;
                  elevations = [];
                  hasUndefinedValue = false;
                  data.results.forEach(function (val) {
                    if (val.elevation === 0) {
                      // If no height data exists, API returns 0
                      // As an approximation, we'll use the previous value
                      val.elevation = previous;
                      if (previous === undefined) hasUndefinedValue = true;
                    }

                    elevations.push({
                      lat: val.latitude,
                      lng: val.longitude,
                      z: val.elevation
                    });
                    previous = val.elevation;
                  });

                  if (hasUndefinedValue) {
                    // If we're unlucky and no height data exists for the first point(s),
                    // then we approximate to the next value
                    for (i = elevations.length - 1; i >= 0; i -= 1) {
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

                  return _context.abrupt("return", elevations);

                case 12:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    },
    fetchSlopes: function fetchSlopes() {
      return Promise.reject(new Error('Unsupported'));
    }
  });

  var opentopodata = L__default['default'].Class.extend({
    options: {
      dataset: 'aster30m',
      queueConcurrency: 5
    },
    initialize: function initialize(server, map, options) {
      this.server = server; // https://api.opentopodata.org

      this._map = map;
      this.features = {
        altitudes: true,
        slopes: false
      };
      this.precision = 6;
      L__default['default'].Util.setOptions(this, options);
      this._queue = new Queue__default['default'](this.options.queueConcurrency, Infinity);
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

        if (geometry.length === 100) {
          // Launch batch
          var g = geometry.splice(0);
          promises.push(_this._queue.add(function () {
            return _this._fetchBatchAltitude(g, eventTarget);
          }));
        }
      });

      if (geometry.length > 0) {
        // Launch last batch
        var g = geometry.splice(0);
        promises.push(this._queue.add(function () {
          return _this._fetchBatchAltitude(g, eventTarget);
        }));
      }

      return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function (data) {
          var results = [];
          data.forEach(function (x) {
            return results.push.apply(results, toConsumableArray(x));
          });
          resolve(results);
        })["catch"](function (e) {
          return reject(e);
        });
      });
    },
    _fetchBatchAltitude: function _fetchBatchAltitude(geometry, eventTarget) {
      var latlngs = geometry.map(function (x) {
        return "".concat(x.lat, ",").concat(x.lon);
      }).join('|');
      var url = "".concat(this.server, "/v1/").concat(this.options.dataset, "?locations=").concat(latlngs);
      return window.fetch(url).then( /*#__PURE__*/function () {
        var _ref = asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(response) {
          var contentType, data, elevations, previous, hasUndefinedValue, i;
          return regenerator.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  contentType = response.headers.get('content-type');

                  if (!(!contentType || contentType.indexOf('application/json') === -1)) {
                    _context.next = 3;
                    break;
                  }

                  throw new Error('Error: invalid response');

                case 3:
                  _context.next = 5;
                  return response.json();

                case 5:
                  data = _context.sent;

                  if (!(data.status !== 'OK')) {
                    _context.next = 8;
                    break;
                  }

                  throw new Error("Status is ".concat(data.status));

                case 8:
                  elevations = [];
                  hasUndefinedValue = false;
                  data.results.forEach(function (val) {
                    if (val.elevation === null) {
                      // If no height data exists, API returns null
                      // As an approximation, we'll use the previous value
                      val.elevation = previous;
                      if (previous === undefined) hasUndefinedValue = true;
                    }

                    elevations.push({
                      lat: val.location.lat,
                      lng: val.location.lng,
                      z: val.elevation
                    });
                    previous = val.elevation;
                  });

                  if (hasUndefinedValue) {
                    // If we're unlucky and no height data exists for the first point(s),
                    // then we approximate to the next value
                    for (i = elevations.length - 1; i >= 0; i -= 1) {
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

                  return _context.abrupt("return", elevations);

                case 14:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }());
    },
    fetchSlopes: function fetchSlopes() {
      return Promise.reject(new Error('Unsupported'));
    }
  });

  L__default['default'].TrackStats = {
    cache: cache,
    Geoportail: geoportail,
    OpenElevation: openelevation,
    OpenTopoData: opentopodata,
    Stats: stats_1,
    geoportail: function geoportail$1(apiKey, map, options) {
      return new geoportail(apiKey, map, options);
    },
    openElevation: function openElevation(map, options) {
      return new openelevation(map, options);
    },
    openTopoData: function openTopoData(server, map, options) {
      return new opentopodata(server, map, options);
    }
  };
  var src = L__default['default'].TrackStats;

  return src;

})));
//# sourceMappingURL=leaflet.trackstats.umd.js.map
