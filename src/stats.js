const L = require('leaflet');

const stats = L.Class.extend({
  options: {},

  initialize(latlngs, options) {
    L.Util.setOptions(this, options);

    this.startingDistance = 0;
    this.distance = 0;
    this.altMin = Number.MAX_VALUE;
    this.altMax = Number.MIN_VALUE;
    this.heightDiffUp = 0;
    this.heightDiffDown = 0;
    this.slopeMin = Number.MAX_VALUE;
    this.slopeMax = Number.MIN_VALUE;
    this.slopeTerrainMin = Number.MAX_VALUE;
    this.slopeTerrainMax = Number.MIN_VALUE;
    this.latlngs = [];

    if (latlngs.length === 0) {
      return;
    }

    const elevations = JSON.parse(JSON.stringify(latlngs)); // deep copy

    this.altMin = elevations[0].z;
    this.altMax = elevations[0].z;
    this.slopeTerrainMin = elevations[0].slope;
    this.slopeTerrainMax = elevations[0].slope;

    elevations[0].dist = 0;
    elevations[0].slopeOnTrack = 0;

    this.latlngs.push(elevations[0]);

    let j = 0;
    for (let i = 1; i < elevations.length; i += 1) {
      const localDistance = L.latLng(elevations[i]).distanceTo(L.latLng(this.latlngs[j])); // m
      if (localDistance > 0) {
        this.distance += localDistance / 1000; // km

        j += 1;
        this.latlngs[j] = elevations[i];
        const current = this.latlngs[j];

        current.dist = this.distance;

        if (current.z) {
          if (current.z < this.altMin) this.altMin = current.z;
          if (current.z > this.altMax) this.altMax = current.z;

          const altDiff = current.z - this.latlngs[j - 1].z;

          if (altDiff < 0) {
            this.heightDiffDown += Math.round(-altDiff);
          } else if (altDiff > 0) {
            this.heightDiffUp += Math.round(altDiff);
          }
          // else can happen if some data is missing, we choose to ignore it

          current.slopeOnTrack = Math.round(Math.degrees(Math.atan(altDiff / localDistance)));
        } else {
          current.slopeOnTrack = 0;
        }

        if (current.slope) {
          if (current.slope < this.slopeTerrainMin) this.slopeTerrainMin = current.slope;
          if (current.slope > this.slopeTerrainMax) this.slopeTerrainMax = current.slope;
        }
      }
    }

    const size = this.latlngs.length;
    for (let i = 0; i < size; i += 1) {
      if (i > 3 && i < size - 4) {
        this.latlngs[i].slopeOnTrack = (this.latlngs[i - 3].slopeOnTrack
            + 2 * this.latlngs[i - 2].slopeOnTrack
            + 4 * this.latlngs[i - 1].slopeOnTrack
            + 8 * this.latlngs[i].slopeOnTrack
            + 4 * this.latlngs[i + 1].slopeOnTrack
            + 2 * this.latlngs[i + 2].slopeOnTrack
            + this.latlngs[i + 3].slopeOnTrack)
          / 22;

        if (this.latlngs[i].slopeOnTrack < this.slopeMin) this.slopeMin = this.latlngs[i].slopeOnTrack;
        if (this.latlngs[i].slopeOnTrack > this.slopeMax) this.slopeMax = this.latlngs[i].slopeOnTrack;
      }
    }

    if (this.altMin === undefined) {
      this.heightDiffUp = undefined;
      this.heightDiffDown = undefined;
      this.slopeMax = undefined;
      this.slopeMin = undefined;
    }
  },

  accumulate(accumulator) {
    accumulator.latlngs = accumulator.latlngs.concat(
      this.getLatLngs().map((x) => {
        x.dist += accumulator.distance;
        return x;
      }),
    );

    accumulator.distance += this.distance;
    accumulator.altMin = Math.min(this.altMin, accumulator.altMin);
    accumulator.altMax = Math.max(this.altMax, accumulator.altMax);
    accumulator.heightDiffUp += this.heightDiffUp;
    accumulator.heightDiffDown += this.heightDiffDown;
    accumulator.slopeMin = Math.min(this.slopeMin, accumulator.slopeMin);
    accumulator.slopeMax = Math.max(this.slopeMax, accumulator.slopeMax);
    accumulator.slopeTerrainMin = Math.min(this.slopeTerrainMin, accumulator.slopeTerrainMin);
    accumulator.slopeTerrainMax = Math.max(this.slopeTerrainMax, accumulator.slopeTerrainMax);

    return this;
  },

  getLatLngs() {
    return JSON.parse(JSON.stringify(this.latlngs)); // deep copy
  },
  getDistance() {
    return this.distance;
  },
  getAltMin() {
    return this.altMin;
  },
  getAltMax() {
    return this.altMax;
  },
  getSlopeMin() {
    return this.slopeMin;
  },
  getSlopeMax() {
    return this.slopeMax;
  },
  getHeightDiffUp() {
    return this.heightDiffUp;
  },
  getHeightDiffDown() {
    return this.heightDiffDown;
  },
  getSlopeTerrainMin() {
    return this.slopeTerrainMin;
  },
  getSlopeTerrainMax() {
    return this.slopeTerrainMax;
  },
});

module.exports = stats;
