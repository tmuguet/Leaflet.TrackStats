const metadatas = {};

// Rounds to 8 decimals (IGN API does not support/give more precise data)
if (typeof Math.roundE8 === 'undefined') {
  Math.roundE8 = function roundE8(value) {
    return Math.round(value * 100000000) / 100000000;
  };
}

function getKeyLatLng(lat, lng) {
  return `${Math.roundE8(lng)}/${Math.roundE8(lat)}`;
}

function getKey(coords) {
  return getKeyLatLng(coords.lat, coords.lng);
}

module.exports = {
  add(t, coords) {
    const key = getKey(coords);
    if (!(key in metadatas)) metadatas[key] = {};

    metadatas[key][t] = coords[t];

    return this;
  },
  get(t, coords) {
    const key = getKey(coords);
    return key in metadatas && t in metadatas[key] ? metadatas[key][t] : undefined;
  },

  has(t, coords) {
    const key = getKey(coords);
    return key in metadatas && t in metadatas[key];
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
    const key = getKey(coords);
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
