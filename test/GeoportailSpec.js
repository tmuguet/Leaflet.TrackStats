describe('Geoportail', () => {
  let map;

  const Listener = L.Evented.extend({});
  let listener;

  beforeEach(() => {
    const _this = this;
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
    listener = new Listener();

    this.xhr = sinon.useFakeXMLHttpRequest();
    this.requests = [];

    this.xhr.onCreate = function (xhr) {
      _this.requests.push(xhr);
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
      const gp = L.TrackStats.geoportail('key', map);
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
        { 'Content-Type': 'application/xml' },
        '<elevations><elevation><lon>6.070504</lon><lat>44.971296</lat><z>1900.64</z><acc>2.5</acc></elevation></elevations>',
      );

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(1);
      expect(result[0]).to.deep.equal({ lat: 44.971296, lng: 6.070504, z: 1900.64 });

      expect(events).to.be.equal(1);
    });

    it('fetching multiple batches should give correct result', async () => {
      const gp = L.TrackStats.geoportail('key', map);

      const latlngs = [];
      const expectedResults = [];
      let xmlBatch1 = '<elevations>';
      let xmlBatch2 = '<elevations>';

      for (let i = 0; i < 50; i += 1) {
        const latlng = L.latLng(44 + i / 10, 6 + i / 10);
        latlngs.push(latlng);
        expectedResults.push({ lat: latlng.lat, lng: latlng.lng, z: i });
        xmlBatch1 += `<elevation><lon>${latlng.lng}</lon><lat>${latlng.lat}</lat><z>${i}</z><acc>0</acc></elevation>`;
      }
      xmlBatch1 += '</elevations>';

      for (let i = 0; i < 30; i += 1) {
        const latlng = L.latLng(45 + i / 10, 5 + i / 10);
        latlngs.push(latlng);
        expectedResults.push({ lat: latlng.lat, lng: latlng.lng, z: i });
        xmlBatch2 += `<elevation><lon>${latlng.lng}</lon><lat>${latlng.lat}</lat><z>${i}</z><acc>0</acc></elevation>`;
      }
      xmlBatch2 += '</elevations>';

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('altitudes');
        expect(e.size).to.be.equal(events === 1 ? 50 : 30);
      });

      const promise = gp.fetchAltitudes(latlngs, listener);
      expect(this.requests).to.be.lengthOf(2);
      this.requests[0].respond(200, { 'Content-Type': 'application/xml' }, xmlBatch1);
      this.requests[1].respond(200, { 'Content-Type': 'application/xml' }, xmlBatch2);

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(80);
      expect(result).to.deep.equal(expectedResults);

      expect(events).to.be.equal(2);
    });

    it('HTTP error to one batch should reject the promise', async () => {
      const gp = L.TrackStats.geoportail('key', map);

      const latlngs = [];
      const xmlBatch2 = '<elevations/>';

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
        { 'Content-Type': 'application/xml' },
        '<ExceptionReport><Exception exceptionCode="MissingParameter">Key does not exist or has expired</Exception></ExceptionReport>',
      );
      this.requests[1].respond(200, { 'Content-Type': 'application/xml' }, xmlBatch2);

      return promise.then(
        (value) => {
          expect(true).to.be.false;
        },
        (reason) => {
          expect(reason.message).to.be.equal('The response of the service is empty');
        },
      );
    });
  });

  describe('Slopes', () => {
    it('fetching one altitude should give correct result', async () => {
      const gp = L.TrackStats.geoportail('key', map);
      const latlng = L.latLng(44.971296, 6.070504);

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('slopes');
        expect(e.size).to.be.equal(1);
      });

      const promise = gp.fetchSlopes([latlng], listener);
      expect(this.requests).to.be.lengthOf(1);
      this.requests[0].respond(
        200,
        { 'Content-Type': 'application/json' },
        JSON.stringify({
          results: [
            {
              lat: 44.971296,
              lon: 6.070504,
              x: 255,
              y: 179,
              slope: 40,
            },
          ],
        }),
      );

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(1);
      expect(result[0]).to.deep.equal({ lat: 44.971296, lng: 6.070504, slope: 40 });

      expect(events).to.be.equal(1);
    });

    it('fetching multiple batches should give correct result', async () => {
      const gp = L.TrackStats.geoportail('key', map);

      const latlngs = [
        L.latLng(44.962068, 6.04797),
        L.latLng(44.962031, 6.0479),
        L.latLng(44.962024, 6.04785),
        L.latLng(44.961932, 6.047807),
        L.latLng(44.961922, 6.047781),
        L.latLng(44.961968, 6.047743),
        L.latLng(44.962041, 6.047709),
        L.latLng(44.96208, 6.047682),
        L.latLng(44.962058, 6.047611),
        L.latLng(44.962019, 6.047586),
        L.latLng(44.961991, 6.047523),
        L.latLng(44.961945, 6.047497),
        L.latLng(44.961932, 6.047446),
        L.latLng(44.961995, 6.047419),
        L.latLng(44.962064, 6.047426),
        L.latLng(44.962062, 6.047348),
        L.latLng(44.962008, 6.047265),
        L.latLng(44.961959, 6.047233),
        L.latLng(44.961914, 6.047213),
        L.latLng(44.961883, 6.047169),
        L.latLng(44.961876, 6.047117),
        L.latLng(44.961907, 6.047081),
        L.latLng(44.961899, 6.046989),
        L.latLng(44.961831, 6.046923),
        L.latLng(44.961845, 6.046874),
        L.latLng(44.961787, 6.046784),
        L.latLng(44.961707, 6.046664),
        L.latLng(44.961655, 6.046631),
        L.latLng(44.961592, 6.046566),
        L.latLng(44.961552, 6.046502),
        L.latLng(44.961465, 6.046484),
        L.latLng(44.9614, 6.046478),
        L.latLng(44.961275, 6.046483),
        L.latLng(44.96119, 6.046482),
        L.latLng(44.961137, 6.046515),
        L.latLng(44.961043, 6.046473),
        L.latLng(44.960989, 6.046451),
        L.latLng(44.961054, 6.046327),
        L.latLng(44.961139, 6.046154),
        L.latLng(44.961013, 6.046146),
        L.latLng(44.960958, 6.046141),
        L.latLng(44.96089, 6.046056),
        L.latLng(44.96086, 6.045892),
        L.latLng(44.960882, 6.045698),
        L.latLng(44.960871, 6.045609),
        L.latLng(44.960845, 6.045496),
        L.latLng(44.960755, 6.045382),
        L.latLng(44.960614, 6.045309),
        L.latLng(44.96045, 6.045222),
        L.latLng(44.960357, 6.045165),
        L.latLng(44.960267, 6.045144),
        L.latLng(44.960188, 6.045151),
        L.latLng(44.960139, 6.045141),
        L.latLng(44.960105, 6.045135),
        L.latLng(44.96003, 6.045203),
        L.latLng(44.959926, 6.045311),
        L.latLng(44.959852, 6.045372),
        L.latLng(44.959794, 6.045396),
        L.latLng(44.959697, 6.045445),
        L.latLng(44.959564, 6.045462),
        L.latLng(44.959495, 6.045467),
        L.latLng(44.959443, 6.04544),
        L.latLng(44.959375, 6.045407),
        L.latLng(44.959331, 6.045386),
        L.latLng(44.959277, 6.045393),
        L.latLng(44.959277, 6.045393),
        L.latLng(44.959277, 6.045374),
        L.latLng(44.959211, 6.045377),
      ];
      const expectedResults = [
        { lat: 44.96089, lng: 6.046056, slope: 0 },
        { lat: 44.96086, lng: 6.045892, slope: 0 },
        { lat: 44.960882, lng: 6.045698, slope: 0 },
        { lat: 44.960871, lng: 6.045609, slope: 0 },
        { lat: 44.960845, lng: 6.045496, slope: 0 },
        { lat: 44.960755, lng: 6.045382, slope: 0 },
        { lat: 44.960614, lng: 6.045309, slope: 0 },
        { lat: 44.96045, lng: 6.045222, slope: 0 },
        { lat: 44.960357, lng: 6.045165, slope: 0 },
        { lat: 44.960267, lng: 6.045144, slope: 30 },
        { lat: 44.960188, lng: 6.045151, slope: 0 },
        { lat: 44.960139, lng: 6.045141, slope: 0 },
        { lat: 44.960105, lng: 6.045135, slope: 35 },
        { lat: 44.96003, lng: 6.045203, slope: 0 },
        { lat: 44.959926, lng: 6.045311, slope: 0 },
        { lat: 44.959852, lng: 6.045372, slope: 0 },
        { lat: 44.959794, lng: 6.045396, slope: 0 },
        { lat: 44.959697, lng: 6.045445, slope: 0 },
        { lat: 44.959564, lng: 6.045462, slope: 0 },
        { lat: 44.959495, lng: 6.045467, slope: 0 },
        { lat: 44.959443, lng: 6.04544, slope: 0 },
        { lat: 44.959375, lng: 6.045407, slope: 0 },
        { lat: 44.959331, lng: 6.045386, slope: 0 },
        { lat: 44.959277, lng: 6.045393, slope: 0 },
        { lat: 44.959277, lng: 6.045393, slope: 0 },
        { lat: 44.959277, lng: 6.045374, slope: 0 },
        { lat: 44.959211, lng: 6.045377, slope: 0 },
        { lat: 44.962068, lng: 6.04797, slope: 40 },
        { lat: 44.962031, lng: 6.0479, slope: 40 },
        { lat: 44.962024, lng: 6.04785, slope: 45 },
        { lat: 44.961932, lng: 6.047807, slope: 35 },
        { lat: 44.961922, lng: 6.047781, slope: 0 },
        { lat: 44.961968, lng: 6.047743, slope: 40 },
        { lat: 44.962041, lng: 6.047709, slope: 0 },
        { lat: 44.96208, lng: 6.047682, slope: 45 },
        { lat: 44.962058, lng: 6.047611, slope: 35 },
        { lat: 44.962019, lng: 6.047586, slope: 40 },
        { lat: 44.961991, lng: 6.047523, slope: 35 },
        { lat: 44.961945, lng: 6.047497, slope: 35 },
        { lat: 44.961932, lng: 6.047446, slope: 0 },
        { lat: 44.961995, lng: 6.047419, slope: 35 },
        { lat: 44.962064, lng: 6.047426, slope: 30 },
        { lat: 44.962062, lng: 6.047348, slope: 30 },
        { lat: 44.962008, lng: 6.047265, slope: 35 },
        { lat: 44.961959, lng: 6.047233, slope: 30 },
        { lat: 44.961914, lng: 6.047213, slope: 30 },
        { lat: 44.961883, lng: 6.047169, slope: 30 },
        { lat: 44.961876, lng: 6.047117, slope: 0 },
        { lat: 44.961907, lng: 6.047081, slope: 0 },
        { lat: 44.961899, lng: 6.046989, slope: 0 },
        { lat: 44.961831, lng: 6.046923, slope: 0 },
        { lat: 44.961845, lng: 6.046874, slope: 0 },
        { lat: 44.961787, lng: 6.046784, slope: 0 },
        { lat: 44.961707, lng: 6.046664, slope: 0 },
        { lat: 44.961655, lng: 6.046631, slope: 30 },
        { lat: 44.961592, lng: 6.046566, slope: 35 },
        { lat: 44.961552, lng: 6.046502, slope: 0 },
        { lat: 44.961465, lng: 6.046484, slope: 30 },
        { lat: 44.9614, lng: 6.046478, slope: 0 },
        { lat: 44.961275, lng: 6.046483, slope: 0 },
        { lat: 44.96119, lng: 6.046482, slope: 0 },
        { lat: 44.961137, lng: 6.046515, slope: 0 },
        { lat: 44.961043, lng: 6.046473, slope: 0 },
        { lat: 44.960989, lng: 6.046451, slope: 0 },
        { lat: 44.961054, lng: 6.046327, slope: 0 },
        { lat: 44.961139, lng: 6.046154, slope: 0 },
        { lat: 44.961013, lng: 6.046146, slope: 0 },
        { lat: 44.960958, lng: 6.046141, slope: 0 },
      ];
      const jsonBatch1 = [
        {
          lat: 44.96089,
          lon: 6.046056,
          x: 166,
          y: 1,
          slope: 0,
        },
        {
          lat: 44.96086,
          lon: 6.045892,
          x: 158,
          y: 3,
          slope: 0,
        },
        {
          lat: 44.960882,
          lon: 6.045698,
          x: 149,
          y: 1,
          slope: 0,
        },
        {
          lat: 44.960871,
          lon: 6.045609,
          x: 145,
          y: 2,
          slope: 0,
        },
        {
          lat: 44.960845,
          lon: 6.045496,
          x: 140,
          y: 4,
          slope: 0,
        },
        {
          lat: 44.960755,
          lon: 6.045382,
          x: 135,
          y: 10,
          slope: 0,
        },
        {
          lat: 44.960614,
          lon: 6.045309,
          x: 131,
          y: 19,
          slope: 0,
        },
        {
          lat: 44.96045,
          lon: 6.045222,
          x: 127,
          y: 30,
          slope: 0,
        },
        {
          lat: 44.960357,
          lon: 6.045165,
          x: 125,
          y: 36,
          slope: 0,
        },
        {
          lat: 44.960267,
          lon: 6.045144,
          x: 124,
          y: 42,
          slope: 30,
        },
        {
          lat: 44.960188,
          lon: 6.045151,
          x: 124,
          y: 47,
          slope: 0,
        },
        {
          lat: 44.960139,
          lon: 6.045141,
          x: 123,
          y: 50,
          slope: 0,
        },
        {
          lat: 44.960105,
          lon: 6.045135,
          x: 123,
          y: 53,
          slope: 35,
        },
        {
          lat: 44.96003,
          lon: 6.045203,
          x: 126,
          y: 58,
          slope: 0,
        },
        {
          lat: 44.959926,
          lon: 6.045311,
          x: 131,
          y: 64,
          slope: 0,
        },
        {
          lat: 44.959852,
          lon: 6.045372,
          x: 134,
          y: 69,
          slope: 0,
        },
        {
          lat: 44.959794,
          lon: 6.045396,
          x: 135,
          y: 73,
          slope: 0,
        },
        {
          lat: 44.959697,
          lon: 6.045445,
          x: 138,
          y: 79,
          slope: 0,
        },
        {
          lat: 44.959564,
          lon: 6.045462,
          x: 138,
          y: 88,
          slope: 0,
        },
        {
          lat: 44.959495,
          lon: 6.045467,
          x: 139,
          y: 93,
          slope: 0,
        },
        {
          lat: 44.959443,
          lon: 6.04544,
          x: 137,
          y: 96,
          slope: 0,
        },
        {
          lat: 44.959375,
          lon: 6.045407,
          x: 136,
          y: 101,
          slope: 0,
        },
        {
          lat: 44.959331,
          lon: 6.045386,
          x: 135,
          y: 104,
          slope: 0,
        },
        {
          lat: 44.959277,
          lon: 6.045393,
          x: 135,
          y: 107,
          slope: 0,
        },
        {
          lat: 44.959277,
          lon: 6.045393,
          x: 135,
          y: 107,
          slope: 0,
        },
        {
          lat: 44.959277,
          lon: 6.045374,
          x: 134,
          y: 107,
          slope: 0,
        },
        {
          lat: 44.959211,
          lon: 6.045377,
          x: 134,
          y: 111,
          slope: 0,
        },
      ];
      const jsonBatch2 = [
        {
          lat: 44.962068,
          lon: 6.04797,
          x: 255,
          y: 179,
          slope: 40,
        },
        {
          lat: 44.962031,
          lon: 6.0479,
          x: 252,
          y: 182,
          slope: 40,
        },
        {
          lat: 44.962024,
          lon: 6.04785,
          x: 250,
          y: 182,
          slope: 45,
        },
        {
          lat: 44.961932,
          lon: 6.047807,
          x: 248,
          y: 188,
          slope: 35,
        },
        {
          lat: 44.961922,
          lon: 6.047781,
          x: 247,
          y: 189,
          slope: 0,
        },
        {
          lat: 44.961968,
          lon: 6.047743,
          x: 245,
          y: 186,
          slope: 40,
        },
        {
          lat: 44.962041,
          lon: 6.047709,
          x: 243,
          y: 181,
          slope: 0,
        },
        {
          lat: 44.96208,
          lon: 6.047682,
          x: 242,
          y: 179,
          slope: 45,
        },
        {
          lat: 44.962058,
          lon: 6.047611,
          x: 239,
          y: 180,
          slope: 35,
        },
        {
          lat: 44.962019,
          lon: 6.047586,
          x: 237,
          y: 183,
          slope: 40,
        },
        {
          lat: 44.961991,
          lon: 6.047523,
          x: 234,
          y: 184,
          slope: 35,
        },
        {
          lat: 44.961945,
          lon: 6.047497,
          x: 233,
          y: 187,
          slope: 35,
        },
        {
          lat: 44.961932,
          lon: 6.047446,
          x: 231,
          y: 188,
          slope: 0,
        },
        {
          lat: 44.961995,
          lon: 6.047419,
          x: 230,
          y: 184,
          slope: 35,
        },
        {
          lat: 44.962064,
          lon: 6.047426,
          x: 230,
          y: 180,
          slope: 30,
        },
        {
          lat: 44.962062,
          lon: 6.047348,
          x: 226,
          y: 180,
          slope: 30,
        },
        {
          lat: 44.962008,
          lon: 6.047265,
          x: 222,
          y: 183,
          slope: 35,
        },
        {
          lat: 44.961959,
          lon: 6.047233,
          x: 221,
          y: 186,
          slope: 30,
        },
        {
          lat: 44.961914,
          lon: 6.047213,
          x: 220,
          y: 189,
          slope: 30,
        },
        {
          lat: 44.961883,
          lon: 6.047169,
          x: 218,
          y: 191,
          slope: 30,
        },
        {
          lat: 44.961876,
          lon: 6.047117,
          x: 216,
          y: 192,
          slope: 0,
        },
        {
          lat: 44.961907,
          lon: 6.047081,
          x: 214,
          y: 190,
          slope: 0,
        },
        {
          lat: 44.961899,
          lon: 6.046989,
          x: 210,
          y: 190,
          slope: 0,
        },
        {
          lat: 44.961831,
          lon: 6.046923,
          x: 207,
          y: 195,
          slope: 0,
        },
        {
          lat: 44.961845,
          lon: 6.046874,
          x: 204,
          y: 194,
          slope: 0,
        },
        {
          lat: 44.961787,
          lon: 6.046784,
          x: 200,
          y: 198,
          slope: 0,
        },
        {
          lat: 44.961707,
          lon: 6.046664,
          x: 194,
          y: 203,
          slope: 0,
        },
        {
          lat: 44.961655,
          lon: 6.046631,
          x: 193,
          y: 207,
          slope: 30,
        },
        {
          lat: 44.961592,
          lon: 6.046566,
          x: 190,
          y: 211,
          slope: 35,
        },
        {
          lat: 44.961552,
          lon: 6.046502,
          x: 187,
          y: 213,
          slope: 0,
        },
        {
          lat: 44.961465,
          lon: 6.046484,
          x: 186,
          y: 219,
          slope: 30,
        },
        {
          lat: 44.9614,
          lon: 6.046478,
          x: 186,
          y: 223,
          slope: 0,
        },
        {
          lat: 44.961275,
          lon: 6.046483,
          x: 186,
          y: 232,
          slope: 0,
        },
        {
          lat: 44.96119,
          lon: 6.046482,
          x: 186,
          y: 237,
          slope: 0,
        },
        {
          lat: 44.961137,
          lon: 6.046515,
          x: 188,
          y: 241,
          slope: 0,
        },
        {
          lat: 44.961043,
          lon: 6.046473,
          x: 186,
          y: 247,
          slope: 0,
        },
        {
          lat: 44.960989,
          lon: 6.046451,
          x: 185,
          y: 250,
          slope: 0,
        },
        {
          lat: 44.961054,
          lon: 6.046327,
          x: 179,
          y: 246,
          slope: 0,
        },
        {
          lat: 44.961139,
          lon: 6.046154,
          x: 171,
          y: 240,
          slope: 0,
        },
        {
          lat: 44.961013,
          lon: 6.046146,
          x: 170,
          y: 249,
          slope: 0,
        },
        {
          lat: 44.960958,
          lon: 6.046141,
          x: 170,
          y: 252,
          slope: 0,
        },
      ];

      let events = 0;
      listener.on('TrackStats:fetched', (e) => {
        events += 1;
        expect(e.datatype).to.be.equal('slopes');
        expect(e.size).to.be.equal(events === 1 ? jsonBatch1.length : jsonBatch2.length);
      });

      const promise = gp.fetchSlopes(latlngs, listener);
      expect(this.requests).to.be.lengthOf(2);
      this.requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ results: jsonBatch1 }));
      this.requests[1].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify({ results: jsonBatch2 }));

      const result = await promise;
      expect(result).to.be.an('array');
      expect(result).to.be.lengthOf(68);
      expect(result).to.deep.equal(expectedResults);

      expect(events).to.be.equal(2);
    });

    it('HTTP error to one batch should reject the promise', async () => {
      const gp = L.TrackStats.geoportail('key', map);

      const latlngs = [
        L.latLng(44.962068, 6.04797),
        L.latLng(44.962031, 6.0479),
        L.latLng(44.962024, 6.04785),
        L.latLng(44.961932, 6.047807),
        L.latLng(44.961922, 6.047781),
        L.latLng(44.961968, 6.047743),
        L.latLng(44.962041, 6.047709),
        L.latLng(44.96208, 6.047682),
        L.latLng(44.962058, 6.047611),
        L.latLng(44.962019, 6.047586),
        L.latLng(44.961991, 6.047523),
        L.latLng(44.961945, 6.047497),
        L.latLng(44.961932, 6.047446),
        L.latLng(44.961995, 6.047419),
        L.latLng(44.962064, 6.047426),
        L.latLng(44.962062, 6.047348),
        L.latLng(44.962008, 6.047265),
        L.latLng(44.961959, 6.047233),
        L.latLng(44.961914, 6.047213),
        L.latLng(44.961883, 6.047169),
        L.latLng(44.961876, 6.047117),
        L.latLng(44.961907, 6.047081),
        L.latLng(44.961899, 6.046989),
        L.latLng(44.961831, 6.046923),
        L.latLng(44.961845, 6.046874),
        L.latLng(44.961787, 6.046784),
        L.latLng(44.961707, 6.046664),
        L.latLng(44.961655, 6.046631),
        L.latLng(44.961592, 6.046566),
        L.latLng(44.961552, 6.046502),
        L.latLng(44.961465, 6.046484),
        L.latLng(44.9614, 6.046478),
        L.latLng(44.961275, 6.046483),
        L.latLng(44.96119, 6.046482),
        L.latLng(44.961137, 6.046515),
        L.latLng(44.961043, 6.046473),
        L.latLng(44.960989, 6.046451),
        L.latLng(44.961054, 6.046327),
        L.latLng(44.961139, 6.046154),
        L.latLng(44.961013, 6.046146),
        L.latLng(44.960958, 6.046141),
        L.latLng(44.96089, 6.046056),
        L.latLng(44.96086, 6.045892),
        L.latLng(44.960882, 6.045698),
        L.latLng(44.960871, 6.045609),
        L.latLng(44.960845, 6.045496),
        L.latLng(44.960755, 6.045382),
        L.latLng(44.960614, 6.045309),
        L.latLng(44.96045, 6.045222),
        L.latLng(44.960357, 6.045165),
        L.latLng(44.960267, 6.045144),
        L.latLng(44.960188, 6.045151),
        L.latLng(44.960139, 6.045141),
        L.latLng(44.960105, 6.045135),
        L.latLng(44.96003, 6.045203),
        L.latLng(44.959926, 6.045311),
        L.latLng(44.959852, 6.045372),
        L.latLng(44.959794, 6.045396),
        L.latLng(44.959697, 6.045445),
        L.latLng(44.959564, 6.045462),
        L.latLng(44.959495, 6.045467),
        L.latLng(44.959443, 6.04544),
        L.latLng(44.959375, 6.045407),
        L.latLng(44.959331, 6.045386),
        L.latLng(44.959277, 6.045393),
        L.latLng(44.959277, 6.045393),
        L.latLng(44.959277, 6.045374),
        L.latLng(44.959211, 6.045377),
      ];

      const promise = gp.fetchSlopes(latlngs);
      expect(this.requests).to.be.lengthOf(2);
      this.requests[0].respond(500, { 'Content-Type': 'application/json' }, '{"error": "Unknown error"}');
      this.requests[1].respond(200, { 'Content-Type': 'application/json' }, '{"results": []}');

      return promise.then(
        (value) => {
          expect(true).to.be.false;
        },
        (reason) => {
          expect(reason.message).to.be.equal('Unknown error');
        },
      );
    });
  });
});
