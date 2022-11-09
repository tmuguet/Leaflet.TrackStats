const L = require('leaflet');
require('./stats.polyline');
require('./stats.trackdrawer');
const Stats = require('./stats');
const cache = require('./cache');
const Geoportail = require('./geoportail');
const OpenElevation = require('./openelevation');
const OpenTopoData = require('./opentopodata');

L.TrackStats = {
  cache,
  Geoportail,
  OpenElevation,
  OpenTopoData,
  Stats,

  geoportail(apiKey, map, options) {
    return new Geoportail(apiKey, map, options);
  },
  openElevation(map, options) {
    return new OpenElevation(map, options);
  },
  openTopoData(server, map, options) {
    return new OpenTopoData(server, map, options);
  },
};

module.exports = L.TrackStats;
