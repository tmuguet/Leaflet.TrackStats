const L = require('leaflet');
require('./stats.polyline');
require('./stats.trackdrawer');
require('./stats');
const cache = require('./cache');
const Geoportail = require('./geoportail');

L.TrackStats = {
  cache,
  Geoportail,

  geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  },
};

module.exports = L.TrackStats;
