const metadatas = {};
let precision = 8;

// Rounds to X decimals (IGN API supports up to 8, MapQuest up to 5)
if (typeof Math.roundE === 'undefined') {
  Math.roundE = function roundE(value, decimals) {
    const pow = 10 ** decimals;
    return Math.round(value * pow) / pow;
  };
}

function getKeyLatLng(lat, lng, decimals) {
  return `${Math.roundE(lng, decimals)}/${Math.roundE(lat, decimals)}`;
}

function getKey(coords, decimals) {
  return getKeyLatLng(coords.lat, coords.lng, decimals);
}

module.exports = {
  setPrecision(p) {
    precision = p;
  },

  add(t, coords) {
    const key = getKey(coords, precision);
    if (!(key in metadatas)) metadatas[key] = {};

    metadatas[key][t] = coords[t];

    return this;
  },
  get(t, coords) {
    const key = getKey(coords, precision);
    return key in metadatas && t in metadatas[key] ? metadatas[key][t] : undefined;
  },

  has(t, coords) {
    const key = getKey(coords, precision);
    return key in metadatas && (t === null || t in metadatas[key]);
  },
  hasZ(coords) {
    return this.has('z', coords);
  },
  hasSlope(coords) {
    return this.has('slope', coords);
  },

  addZ(coords) {
    this.add('z', coords);
    return this;
  },
  addSlope(coords) {
    this.add('slope', coords);
    return this;
  },

  getAll(coords) {
    const key = getKey(coords, precision);
    const md = key in metadatas ? metadatas[key] : {};

    return {
      lat: coords.lat,
      lng: coords.lng,
      z: 'z' in md ? md.z : undefined,
      slope: 'slope' in md ? md.slope : undefined,
    };
  },

  clear() {
    Object.keys(metadatas).forEach(x => delete metadatas[x]);
    return this;
  },
};
