const L = require('leaflet');
const corslite = require('@mapbox/corslite');

module.exports = L.Class.extend({
  options: {},

  initialize(apiKey, map, options) {
    this._apiKey = apiKey;
    this._map = map;
    L.Util.setOptions(this, options);
  },

  fetchAltitudes(latlngs, eventTarget) {
    const geometry = [];
    const promises = [];

    latlngs.forEach((coords) => {
      geometry.push({
        lon: coords.lng,
        lat: coords.lat,
      });
      if (geometry.length === 50) {
        // Launch batch
        promises.push(this._fetchBatchAltitude(geometry.splice(0), eventTarget));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      promises.push(this._fetchBatchAltitude(geometry.splice(0), eventTarget));
    }

    return new Promise(async (resolve, reject) => {
      try {
        const data = await Promise.all(promises);
        const results = [];
        data.forEach(x => results.push(...x));
        resolve(results);
      } catch (e) {
        reject(e);
      }
    });
  },

  _fetchBatchAltitude(geometry, eventTarget) {
    const latlngs = geometry.map(x => `${x.lat},${x.lon}`).join(',');
    const url = 'https://open.mapquestapi.com/elevation/v1/profile?shapeFormat=raw&'
      + `latLngCollection=${latlngs}&key=${this._apiKey}`;

    return new Promise((resolve, reject) => {
      corslite(
        url,
        (err, resp) => {
          if (!err) {
            try {
              const data = JSON.parse(resp.responseText);
              const elevations = [];
              let previous;
              let hasUndefinedValue = false;

              data.elevationProfile.forEach((val, i) => {
                if (val.height === -32768) {
                  // If no height data exists, API returns -32768
                  // As an approximation, we'll use the previous value
                  val.height = previous;
                  if (previous === undefined) hasUndefinedValue = true;
                }

                elevations.push({ lat: data.shapePoints[i * 2], lng: data.shapePoints[i * 2 + 1], z: val.height });
                previous = val.height;
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

              resolve(elevations);
            } catch (ex) {
              reject(ex);
            }
          } else {
            reject(new Error(err.response));
          }
        },
        false,
      );
    });
  },

  fetchSlopes() {
    return new Promise(async (resolve, reject) => {
      reject(new Error('Unsupported'));
    });
  },
});
