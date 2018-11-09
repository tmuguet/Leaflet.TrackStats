describe('Cache', () => {
  afterEach(async () => {
    sinon.restore();
    L.TrackStats.cache.clear();
  });

  describe('Get/Set', () => {
    it('Getting uncached data should return undefined', () => {
      const coord = L.latLng(44.974635142416496, 6.064453125000001);
      const coordMetadata = L.TrackStats.cache.getAll(coord);
      expect(coordMetadata.lat).to.be.equal(coord.lat);
      expect(coordMetadata.lng).to.be.equal(coord.lng);
      expect(coordMetadata.z).to.be.undefined;
      expect(coordMetadata.slope).to.be.undefined;

      expect(L.TrackStats.cache.hasZ(coord)).to.be.false;
      expect(L.TrackStats.cache.hasSlope(coord)).to.be.false;
      expect(L.TrackStats.cache.get('z', coord)).to.be.undefined;
      expect(L.TrackStats.cache.get('slope', coord)).to.be.undefined;

      coord.z = 1337;
      coord.slope = -42;
      L.TrackStats.cache.addZ(coord);

      const coord2 = L.latLng(44.974635142416496, 6.064460000000001);
      expect(L.TrackStats.cache.hasZ(coord2)).to.be.false;
      expect(L.TrackStats.cache.hasSlope(coord2)).to.be.false;
      const coord3 = L.latLng(44.974635, 6.064453125000001);
      expect(L.TrackStats.cache.hasZ(coord3)).to.be.false;
      expect(L.TrackStats.cache.hasSlope(coord3)).to.be.false;
    });

    it('Getting cached data should return the data', () => {
      const coord = L.latLng(44.974635142416496, 6.064453125000001);
      coord.z = 1337;
      coord.slope = -42;
      L.TrackStats.cache.addZ(coord);

      const coordMetadata1 = L.TrackStats.cache.getAll(coord);
      expect(coordMetadata1.lat).to.be.equal(coord.lat);
      expect(coordMetadata1.lng).to.be.equal(coord.lng);
      expect(coordMetadata1.z).to.be.equal(1337);
      expect(coordMetadata1.slope).to.be.undefined;

      expect(L.TrackStats.cache.hasZ(coord)).to.be.true;
      expect(L.TrackStats.cache.hasSlope(coord)).to.be.false;
      expect(L.TrackStats.cache.get('z', coord)).to.be.equal(1337);
      expect(L.TrackStats.cache.get('slope', coord)).to.be.undefined;

      L.TrackStats.cache.addSlope(coord);
      const coordMetadata2 = L.TrackStats.cache.getAll(coord);
      expect(coordMetadata2.lat).to.be.equal(coord.lat);
      expect(coordMetadata2.lng).to.be.equal(coord.lng);
      expect(coordMetadata2.z).to.be.equal(1337);
      expect(coordMetadata2.slope).to.be.equal(-42);

      expect(L.TrackStats.cache.hasZ(coord)).to.be.true;
      expect(L.TrackStats.cache.hasSlope(coord)).to.be.true;
      expect(L.TrackStats.cache.get('z', coord)).to.be.equal(1337);
      expect(L.TrackStats.cache.get('slope', coord)).to.be.equal(-42);

      const coord2 = L.latLng(44.96777356135154, 6.06822967529297);
      const coordMetadata3 = L.TrackStats.cache.getAll(coord2);
      expect(coordMetadata3.lat).to.be.equal(coord2.lat);
      expect(coordMetadata3.lng).to.be.equal(coord2.lng);
      expect(coordMetadata3.z).to.be.undefined;
      expect(coordMetadata3.slope).to.be.undefined;

      expect(L.TrackStats.cache.hasZ(coord2)).to.be.false;
      expect(L.TrackStats.cache.hasSlope(coord2)).to.be.false;
      expect(L.TrackStats.cache.get('z', coord2)).to.be.undefined;
      expect(L.TrackStats.cache.get('slope', coord2)).to.be.undefined;
    });
  });

  describe('Cleaning', () => {
    it('Getting cached data after cleaning should return undefined', () => {
      const coord = L.latLng(44.974635142416496, 6.064453125000001);
      coord.z = 1337;
      coord.slope = -42;
      L.TrackStats.cache.addZ(coord).addSlope(coord);

      expect(L.TrackStats.cache.hasZ(coord)).to.be.true;
      expect(L.TrackStats.cache.hasSlope(coord)).to.be.true;

      L.TrackStats.cache.clear();

      expect(L.TrackStats.cache.hasZ(coord)).to.be.false;
      expect(L.TrackStats.cache.hasSlope(coord)).to.be.false;
    });
  });

  describe('Precision', () => {
    it('Cache should use 8 decimal-precision coordinates', () => {
      const coordE15 = L.latLng(44.974635142416496, 6.064453125000001);
      coordE15.z = 1337;
      coordE15.slope = -42;
      L.TrackStats.cache.addZ(coordE15).addSlope(coordE15);

      expect(L.TrackStats.cache.hasZ(coordE15)).to.be.true;
      expect(L.TrackStats.cache.hasSlope(coordE15)).to.be.true;

      const coordRoundedE8 = L.latLng(44.97463514, 6.06445313);
      expect(L.TrackStats.cache.hasZ(coordRoundedE8)).to.be.true;
      expect(L.TrackStats.cache.hasSlope(coordRoundedE8)).to.be.true;

      const coordRoundedE6 = L.latLng(44.974635, 6.064453);
      expect(L.TrackStats.cache.hasZ(coordRoundedE6)).to.be.false;
      expect(L.TrackStats.cache.hasSlope(coordRoundedE6)).to.be.false;
    });
  });
});
