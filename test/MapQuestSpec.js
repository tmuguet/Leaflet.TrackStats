describe('MapQuest', () => {
  let map;

  const Listener = L.Evented.extend({});
  let listener;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
    listener = new Listener();

    this.xhr = sinon.useFakeXMLHttpRequest();
    this.requests = [];

    this.xhr.onCreate = (xhr) => {
      this.requests.push(xhr);
    };
  });

  afterEach(async () => {
    this.xhr.restore();
    sinon.restore();
    listener.off();
    await map.removeAsPromise();
  });

  describe('Altitudes', () => {
    it('fetching one altitude should give correct result', async () => {
      const gp = L.TrackStats.mapquest('key', map);
      const latlng = L.latLng(44.971296, 6.070504);

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.equal(1);
      });

      const promise = gp.fetchAltitudes([latlng], listener);
      expect(this.requests).to.be.lengthOf(1);
      this.requests[0].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          elevationProfile: [{ distance: 0, height: 1900 }],
          shapePoints: [44.971296, 6.070504],
          info: {
            statuscode: 0,
            copyright: {
              imageAltText: '© 2018 MapQuest, Inc.',
              imageUrl: 'http://api.mqcdn.com/res/mqlogo.gif',
              text: '© 2018 MapQuest, Inc.',
            },
            messages: [],
          },
        }),
      );

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(1);
      expect(result[0]).to.deep.equal({ lat: 44.971296, lng: 6.070504, z: 1900 });

      expect(events).to.be.equal(1);
    });

    it('missing one altitude should gracefully fallback', async () => {
      const gp = L.TrackStats.mapquest('key', map);
      const latlngs = [L.latLng(44.971296, 6.070504), L.latLng(44.971396, 6.070604), L.latLng(44.971496, 6.070704)];

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.equal(3);
      });

      const promise = gp.fetchAltitudes(latlngs, listener);
      expect(this.requests).to.be.lengthOf(1);
      this.requests[0].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          elevationProfile: [
            { distance: 0, height: -32768 },
            { distance: 2, height: 1234 },
            { distance: 4, height: -32768 },
          ],
          shapePoints: [44.971296, 6.070504, 44.971396, 6.070604, 44.971496, 6.070704],
          info: {
            statuscode: 0,
            copyright: {
              imageAltText: '© 2018 MapQuest, Inc.',
              imageUrl: 'http://api.mqcdn.com/res/mqlogo.gif',
              text: '© 2018 MapQuest, Inc.',
            },
            messages: [],
          },
        }),
      );

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(3);
      expect(result).to.deep.equal([
        { lat: 44.971296, lng: 6.070504, z: 1234 },
        { lat: 44.971396, lng: 6.070604, z: 1234 },
        { lat: 44.971496, lng: 6.070704, z: 1234 },
      ]);

      expect(events).to.be.equal(1);
    });

    it('fetching multiple batches should give correct result', async () => {
      const gp = L.TrackStats.mapquest('key', map);

      const latlngs = [];
      const expectedResults = [];
      const jsonBatch1 = { elevationProfile: [], shapePoints: [] };
      const jsonBatch2 = { elevationProfile: [], shapePoints: [] };

      for (let i = 0; i < 50; i += 1) {
        const latlng = L.latLng(44 + i / 10, 6 + i / 10);
        latlngs.push(latlng);
        expectedResults.push({ lat: latlng.lat, lng: latlng.lng, z: i });
        jsonBatch1.elevationProfile.push({ distance: i, height: i });
        jsonBatch1.shapePoints.push(latlng.lat);
        jsonBatch1.shapePoints.push(latlng.lng);
      }

      for (let i = 0; i < 30; i += 1) {
        const latlng = L.latLng(45 + i / 10, 5 + i / 10);
        latlngs.push(latlng);
        expectedResults.push({ lat: latlng.lat, lng: latlng.lng, z: i });
        jsonBatch2.elevationProfile.push({ distance: i, height: i });
        jsonBatch2.shapePoints.push(latlng.lat);
        jsonBatch2.shapePoints.push(latlng.lng);
      }

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.equal(events === 1 ? 50 : 30);
      });

      const promise = gp.fetchAltitudes(latlngs, listener);
      expect(this.requests).to.be.lengthOf(2);
      this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(jsonBatch1));
      this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(jsonBatch2));

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(80);
      expect(result).to.deep.equal(expectedResults);

      expect(events).to.be.equal(2);
    });

    it('HTTP error to one batch should reject the promise', async () => {
      const gp = L.TrackStats.mapquest('key', map);

      const latlngs = [];

      for (let i = 0; i < 50; i += 1) {
        const latlng = L.latLng(44 + i / 10, 6 + i / 10);
        latlngs.push(latlng);
      }

      for (let i = 0; i < 30; i += 1) {
        const latlng = L.latLng(45 + i / 10, 5 + i / 10);
        latlngs.push(latlng);
      }

      const promise = gp.fetchAltitudes(latlngs);
      expect(this.requests).to.be.lengthOf(2);
      this.requests[0].respond(
        403,
        { 'Content-Type': 'text/plain' },
        'The AppKey submitted with this request is invalid.',
      );
      this.requests[1].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({ elevationProfile: [], shapePoints: [] }),
      );

      return promise.then(
        () => {
          expect(true).to.be.false;
        },
        (reason) => {
          expect(reason.message).to.be.equal('The AppKey submitted with this request is invalid.');
        },
      );
    });
  });

  describe('Slopes', () => {
    it('fetching slopes should fail', async () => {
      const gp = L.TrackStats.mapquest('key', map);
      const latlng = L.latLng(44.971296, 6.070504);

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('slopes');
        expect(e.size).to.be.equal(1);
      });

      const promise = gp.fetchSlopes([latlng], listener);
      expect(this.requests).to.be.lengthOf(0);
      expect(events).to.be.equal(0);
      return promise.then(
        () => {
          expect(true).to.be.false;
        },
        (reason) => {
          expect(reason.message).to.be.equal('Unsupported');
        },
      );
    });
  });
});
