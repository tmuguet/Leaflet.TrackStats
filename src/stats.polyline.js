const L = require('leaflet');
const cache = require('./cache');
const Stats = require('./stats');

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

  fetchAltitude(fetcher, eventTarget) {
    if (!('altitudes' in fetcher.features) || !fetcher.features.altitudes) {
      return new Promise((resolve, reject) => reject(new Error('Unsupported')));
    }

    cache.setPrecision(fetcher.precision);
    const latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(coords => !cache.hasZ(coords));

    if (eventTarget && latlngs.length > 0) {
      eventTarget.fire('TrackStats:fetching', {
        datatype: 'altitudes',
        size: latlngs.length,
      });
    }

    return new Promise(async (resolve, reject) => {
      try {
        if (latlngs.length > 0) {
          const elevations = await fetcher.fetchAltitudes(latlngs, eventTarget);
          elevations.forEach(x => cache.addZ(x));

          if (eventTarget) {
            eventTarget.fire('TrackStats:done', {
              datatype: 'altitudes',
              size: elevations.length,
            });
          }
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  fetchSlope(fetcher, eventTarget) {
    if (!('slopes' in fetcher.features) || !fetcher.features.slopes) {
      return new Promise((resolve, reject) => reject(new Error('Unsupported')));
    }

    cache.setPrecision(fetcher.precision);
    const latlngs = Array.from(new Set(getLatLngsFlatten(this))).filter(coords => !cache.hasSlope(coords));

    if (eventTarget && latlngs.length > 0) {
      eventTarget.fire('TrackStats:fetching', {
        datatype: 'slopes',
        size: latlngs.length,
      });
    }

    return new Promise(async (resolve, reject) => {
      try {
        if (latlngs.length > 0) {
          const slopes = await fetcher.fetchSlopes(latlngs, eventTarget);
          slopes.forEach(x => cache.addSlope(x));

          if (eventTarget) {
            eventTarget.fire('TrackStats:done', {
              datatype: 'slopes',
              size: slopes.length,
            });
          }
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  },

  fetchInfos(fetcher, eventTarget) {
    const promises = [];
    if ('altitudes' in fetcher.features && fetcher.features.altitudes) {
      promises.push(this.fetchAltitude(fetcher, eventTarget));
    }
    if ('slopes' in fetcher.features && fetcher.features.slopes) {
      promises.push(this.fetchSlope(fetcher, eventTarget));
    }

    return Promise.all(promises);
  },

  computeStats() {
    const latlngs = getLatLngsFlatten(this).map(coords => coords.getCachedInfos());
    this._stats = new Stats(latlngs);
    return this.getStats();
  },
});

L.LatLng.prototype.getCachedInfos = function getCachedInfos() {
  return cache.getAll(this);
};
