const L = require('leaflet');
const cache = require('./cache');
const stats = require('./stats');

if (typeof Math.degrees === 'undefined') {
  // Converts from radians to degrees.
  Math.degrees = function degrees(radians) {
    return (radians * 180) / Math.PI;
  };
}

function getLatLngsFlatten(polyline) {
  const latlngs = polyline.getLatLngs();

  if (latlngs.length > 0 && Array.isArray(latlngs[0])) {
    let result = [];
    for (let j = 0; j < latlngs.length; j += 1) {
      result = result.concat(latlngs[j]);
    }

    return result;
  }
  return latlngs;
}

L.Polyline.include({
  _stats: undefined,

  getStats() {
    return this._stats;
  },

  fetchAltitude(fetcher) {
    const latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(coords => !cache.hasZ(coords));
    return new Promise(async (resolve, reject) => {
      try {
        if (latlngs.length > 0) {
          const elevations = await fetcher.fetchAltitudes(latlngs);
          elevations.forEach(x => cache.addZ(x));
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  fetchSlope(fetcher) {
    const latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(coords => !cache.hasSlope(coords));
    return new Promise(async (resolve, reject) => {
      try {
        if (latlngs.length > 0) {
          const slopes = await fetcher.fetchSlopes(latlngs);
          slopes.forEach(x => cache.addSlope(x));
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  fetchInfos(fetcher) {
    return new Promise(async (resolve, reject) => {
      try {
        await this.fetchAltitude(fetcher);
        await this.fetchSlope(fetcher);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  computeStats() {
    const latlngs = getLatLngsFlatten(this).map(coords => coords.getCachedInfos());
    this._stats = new stats(latlngs);
    return this.getStats();
  },
});

L.LatLng.prototype.getCachedInfos = function getCachedInfos() {
  return cache.getAll(this);
};
