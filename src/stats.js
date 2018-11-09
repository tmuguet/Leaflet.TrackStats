const L = require('leaflet');
const cache = require('./cache');

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

function computePathStats(polyline) {
  const latlngs = getLatLngsFlatten(polyline);

  const elevations = latlngs.map(coords => coords.getCachedInfos());

  if (elevations.length === 0) {
    return null;
  }

  const results = {
    distance: 0,
    altMin: elevations[0].z,
    altMax: elevations[0].z,
    heightDiffUp: 0,
    heightDiffDown: 0,
    slopeMin: Number.MAX_VALUE,
    slopeMax: Number.MIN_VALUE,
    slopeTerrainMin: elevations[0].slope,
    slopeTerrainMax: elevations[0].slope,
    elevations: [],
  };

  elevations[0].dist = 0;
  elevations[0].slopeOnTrack = 0;

  results.elevations.push(elevations[0]);

  let j = 0;
  for (let i = 1; i < elevations.length; i += 1) {
    const localDistance = L.latLng(elevations[i]).distanceTo(L.latLng(results.elevations[j])); // m
    if (localDistance > 0) {
      results.distance += localDistance / 1000; // km

      j += 1;
      results.elevations[j] = elevations[i];
      results.elevations[j].dist = results.distance;
      results.elevations[j].slopeOnTrack = Math.degrees(
        Math.atan((Math.round(results.elevations[j].z) - Math.round(results.elevations[j - 1].z)) / localDistance),
      );

      if (results.elevations[j].z < results.altMin) results.altMin = results.elevations[j].z;
      if (results.elevations[j].z > results.altMax) results.altMax = results.elevations[j].z;

      if (results.elevations[j].slopeOnTrack < results.slopeMin) results.slopeMin = results.elevations[j].slopeOnTrack;
      if (results.elevations[j].slopeOnTrack > results.slopeMax) results.slopeMax = results.elevations[j].slopeOnTrack;

      if (results.elevations[j].z < results.elevations[j - 1].z) {
        results.heightDiffDown += Math.round(results.elevations[j - 1].z - results.elevations[j].z);
      } else {
        results.heightDiffUp += Math.round(results.elevations[j].z - results.elevations[j - 1].z);
      }

      if (results.elevations[j].slope < results.slopeTerrainMin) results.slopeTerrainMin = results.elevations[j].slope;
      if (results.elevations[j].slope > results.slopeTerrainMax) results.slopeTerrainMax = results.elevations[j].slope;
    }
  }

  if (results.altMin === undefined) {
    results.heightDiffUp = undefined;
    results.heightDiffDown = undefined;
    results.slopeMax = undefined;
    results.slopeMin = undefined;
  }

  return results;
}

L.Polyline.include({
  _elevations: [],
  _distance: 0,
  _altMin: 0,
  _altMax: 0,
  _slopeMin: 0,
  _slopeMax: 0,
  _heightDiffUp: 0,
  _heightDiffDown: 0,
  _slopeTerrainMin: 0,
  _slopeTerrainMax: 0,

  getElevations() {
    return JSON.parse(JSON.stringify(this._elevations)); // deep copy
  },
  getDistance() {
    return this._distance;
  },
  getAltMin() {
    return this._altMin;
  },
  getAltMax() {
    return this._altMax;
  },
  getSlopeMin() {
    return this._slopeMin;
  },
  getSlopeMax() {
    return this._slopeMax;
  },
  getHeightDiffUp() {
    return this._heightDiffUp;
  },
  getHeightDiffDown() {
    return this._heightDiffDown;
  },
  getSlopeTerrainMin() {
    return this._slopeTerrainMin;
  },
  getSlopeTerrainMax() {
    return this._slopeTerrainMax;
  },

  fetchAltitude(fetcher) {
    const latlngs = Array.from(new Set(getLatLngsFlatten(this).filter(coords => !cache.hasZ(coords))));
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
    const latlngs = Array.from(new Set(getLatLngsFlatten(this).filter(coords => !cache.hasSlope(coords))));
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
    const results = computePathStats(this);
    if (results === null) {
      return false;
    }
    this._elevations = results.elevations;
    this._distance = results.distance;
    this._altMin = results.altMin;
    this._altMax = results.altMax;
    this._slopeMin = results.slopeMin;
    this._slopeMax = results.slopeMax;
    this._heightDiffUp = results.heightDiffUp;
    this._heightDiffDown = results.heightDiffDown;
    this._slopeTerrainMin = results.slopeTerrainMin;
    this._slopeTerrainMax = results.slopeTerrainMax;
    return true;
  },
});

L.LatLng.prototype.getCachedInfos = function getCachedInfos() {
  return cache.getAll(this);
};
