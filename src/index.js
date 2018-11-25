const L = require('leaflet');
require('./stats.polyline');
require('./stats.trackdrawer');
const Stats = require('./stats');
const cache = require('./cache');
const Geoportail = require('./geoportail');

L.TrackStats = {
  cache,
  Geoportail,
  Stats,

  geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  },
};

module.exports = L.TrackStats;
