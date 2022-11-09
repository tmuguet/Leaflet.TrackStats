describe('OpenElevation', () => {
  let map;

  const Listener = L.Evented.extend({});
  let listener;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
    listener = new Listener();

    this.requests = [];
    this.responses = [];

    sinon.stub(window, 'fetch').callsFake((req) => {
      this.requests.push(req);
      const [code, headers, content] = this.responses[this.requests.length - 1];
      const mockResponse = new window.Response(content, {
        status: code,
        headers,
      });
      return Promise.resolve(mockResponse);
    });
  });

  afterEach(async () => {
    sinon.restore();
    listener.off();
    await map.removeAsPromise();
  });

  describe('Altitudes', () => {
    it('fetching one altitude should give correct result', async () => {
      const gp = L.TrackStats.openElevation(map);
      const latlng = L.latLng(44.971296, 6.070504);

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.equal(1);
      });

      this.responses.push([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          results: [
            {
              elevation: 1524,
              latitude: 44.971296,
              longitude: 6.070504,
            },
          ],
        }),
      ]);
      const result = await gp.fetchAltitudes([latlng], listener);
      expect(this.requests).to.be.lengthOf(1);

      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(1);
      expect(result[0]).to.deep.equal({ lat: 44.971296, lng: 6.070504, z: 1524 });

      expect(events).to.be.equal(1);
    });

    it('missing one altitude should gracefully fallback', async () => {
      const gp = L.TrackStats.openElevation(map);
      const latlngs = [L.latLng(44.971296, 6.070504), L.latLng(44.971396, 6.070604), L.latLng(44.971496, 6.070704)];

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.equal(3);
      });
      this.responses.push([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          results: [
            {
              elevation: 0,
              latitude: 44.971296,
              longitude: 6.070504,
            },
            {
              elevation: 1580.0,
              latitude: 44.971396,
              longitude: 6.070604,
            },
            {
              elevation: 0,
              latitude: 44.971496,
              longitude: 6.070704,
            },
          ],
        }),
      ]);

      const result = await gp.fetchAltitudes(latlngs, listener);
      expect(this.requests).to.be.lengthOf(1);

      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(3);
      expect(result).to.deep.equal([
        { lat: 44.971296, lng: 6.070504, z: 1580.0 },
        { lat: 44.971396, lng: 6.070604, z: 1580.0 },
        { lat: 44.971496, lng: 6.070704, z: 1580.0 },
      ]);

      expect(events).to.be.equal(1);
    });

    it('fetching multiple batches should give correct result', async () => {
      const gp = L.TrackStats.openElevation(map);

      const latlngs = [];
      const expectedResults = [];
      const jsonBatch1 = { results: [] };
      const jsonBatch2 = { results: [] };

      for (let i = 0; i < 1000; i += 1) {
        const latlng = L.latLng(44 + i / 10, 6 + i / 10);
        latlngs.push(latlng);
        expectedResults.push({ lat: latlng.lat, lng: latlng.lng, z: i + 1 });
        jsonBatch1.results.push({ elevation: i + 1, latitude: latlng.lat, longitude: latlng.lng });
      }

      for (let i = 0; i < 30; i += 1) {
        const latlng = L.latLng(45 + i / 10, 5 + i / 10);
        latlngs.push(latlng);
        expectedResults.push({ lat: latlng.lat, lng: latlng.lng, z: i + 1 });
        jsonBatch2.results.push({ elevation: i + 1, latitude: latlng.lat, longitude: latlng.lng });
      }

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.oneOf([1000, 30]);
      });

      this.responses.push([200, { 'Content-Type': 'application/json' }, JSON.stringify(jsonBatch1)]);
      this.responses.push([200, { 'Content-Type': 'application/json' }, JSON.stringify(jsonBatch2)]);

      const result = await gp.fetchAltitudes(latlngs, listener);
      expect(this.requests).to.be.lengthOf(2);

      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(1030);
      expect(result).to.deep.equal(expectedResults);

      expect(events).to.be.equal(2);
    });

    it('HTTP error to one batch should reject the promise', async () => {
      const gp = L.TrackStats.openElevation(map);

      const latlngs = [];

      for (let i = 0; i < 1000; i += 1) {
        const latlng = L.latLng(44 + i / 10, 6 + i / 10);
        latlngs.push(latlng);
      }

      for (let i = 0; i < 30; i += 1) {
        const latlng = L.latLng(45 + i / 10, 5 + i / 10);
        latlngs.push(latlng);
      }
      this.responses.push([
        403,
        { 'Content-Type': 'text/plain' },
        'Error',
      ]);
      this.responses.push([
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ results: [] }),
      ]);

      try {
        await gp.fetchAltitudes(latlngs);
        expect(true).to.be.false;
      } catch (e) {
        expect(e.message).to.be.equal('Error: invalid response');
      }
      expect(this.requests).to.be.lengthOf(2);
    });
  });

  describe('Slopes', () => {
    it('fetching slopes should fail', async () => {
      const gp = L.TrackStats.openElevation(map);
      const latlng = L.latLng(44.971296, 6.070504);

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('slopes');
        expect(e.size).to.be.equal(1);
      });

      try {
        await gp.fetchSlopes([latlng], listener);
        expect(true).to.be.false;
      } catch (e) {
        expect(e.message).to.be.equal('Unsupported');
      }
      expect(this.requests).to.be.lengthOf(0);
      expect(events).to.be.equal(0);
    });
  });
});
