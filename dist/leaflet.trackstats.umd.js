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

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

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
            return results.push.apply(results, _toConsumableArray(x));
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
            return results.push.apply(results, _toConsumableArray(x));
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

  var mapquest = L__default['default'].Class.extend({
    options: {
      queueConcurrency: 5
    },
    initialize: function initialize(apiKey, map, options) {
      this._apiKey = apiKey;
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
            return results.push.apply(results, _toConsumableArray(x));
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
      }).join(',');
      var url = 'https://open.mapquestapi.com/elevation/v1/profile?shapeFormat=raw&' + "latLngCollection=".concat(latlngs, "&key=").concat(this._apiKey);
      return new Promise(function (resolve, reject) {
        corslite__default['default'](url, function (err, resp) {
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
      return new Promise(function (_resolve, reject) {
        reject(new Error('Unsupported'));
      });
    }
  });

  L__default['default'].TrackStats = {
    cache: cache,
    Geoportail: geoportail,
    Mapquest: mapquest,
    Stats: stats_1,
    geoportail: function geoportail$1(apiKey, map, options) {
      return new geoportail(apiKey, map, options);
    },
    mapquest: function mapquest$1(apiKey, map, options) {
      return new mapquest(apiKey, map, options);
    }
  };
  var src = L__default['default'].TrackStats;

  return src;

})));
//# sourceMappingURL=leaflet.trackstats.umd.js.map
