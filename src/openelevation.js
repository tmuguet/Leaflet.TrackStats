const L = require('leaflet');
const Queue = require('promise-queue');

module.exports = L.Class.extend({
  options: {
    server: 'https://api.open-elevation.com/api',
    queueConcurrency: 1,
  },

  initialize(map, options) {
    this._map = map;
    this.features = { altitudes: true, slopes: false };
    this.precision = 6;
    L.Util.setOptions(this, options);
    this._queue = new Queue(this.options.queueConcurrency, Infinity);
  },

  fetchAltitudes(latlngs, eventTarget) {
    const geometry = [];
    const promises = [];

    latlngs.forEach((coords) => {
      geometry.push({
        lon: coords.lng,
        lat: coords.lat,
      });
      if (geometry.length === 1000) {
        // Launch batch
        const g = geometry.splice(0);
        promises.push(this._queue.add(() => this._fetchBatchAltitude(g, eventTarget)));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      const g = geometry.splice(0);
      promises.push(this._queue.add(() => this._fetchBatchAltitude(g, eventTarget)));
    }

    return new Promise((resolve, reject) => {
      Promise.all(promises).then((data) => {
        const results = [];
        data.forEach((x) => results.push(...x));
        resolve(results);
      }).catch((e) => reject(e));
    });
  },

  _fetchBatchAltitude(geometry, eventTarget) {
    const latlngs = geometry.map((x) => ({
      latitude: x.lat,
      longitude: x.lon,
    }));
    const url = `${this.options.server}/v1/lookup`;

    return window.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locations: latlngs,
      }),
    }).then(async (response) => {
      const contentType = response.headers.get('content-type');
      if (!contentType || contentType.indexOf('application/json') === -1) {
        throw new Error('Error: invalid response');
      }

      const data = await response.json();

      const elevations = [];
      let previous;
      let hasUndefinedValue = false;

      data.results.forEach((val) => {
        if (val.elevation === 0) {
          // If no height data exists, API returns 0
          // As an approximation, we'll use the previous value
          val.elevation = previous;
          if (previous === undefined) hasUndefinedValue = true;
        }

        elevations.push({ lat: val.latitude, lng: val.longitude, z: val.elevation });
        previous = val.elevation;
      });

      if (hasUndefinedValue) {
        // If we're unlucky and no height data exists for the first point(s),
        // then we approximate to the next value
        for (let i = elevations.length - 1; i >= 0; i -= 1) {
          if (elevations[i].z === undefined) {
            elevations[i].z = previous;
          }
          previous = elevations[i].z;
        }
      }

      if (eventTarget) {
        eventTarget.fire('TrackStats:fetched', {
          datatype: 'altitudes',
          size: elevations.length,
        });
      }

      return elevations;
    });
  },

  fetchSlopes() {
    return Promise.reject(new Error('Unsupported'));
  },
});
