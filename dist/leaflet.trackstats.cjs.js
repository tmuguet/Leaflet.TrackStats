'use strict';

const L = require('leaflet');
require('./stats.polyline');
require('./stats.trackdrawer');
const Stats = require('./stats');
const cache = require('./cache');
const Geoportail = require('./geoportail');
const Mapquest = require('./mapquest');

L.TrackStats = {
  cache,
  Geoportail,
  Mapquest,
  Stats,

  geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  },
  mapquest(apiKey, map, options) {
    return new Mapquest(apiKey, map, options);
  },
};

module.exports = L.TrackStats;
//# sourceMappingURL=leaflet.trackstats.cjs.js.map
