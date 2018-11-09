const L = require('leaflet');
const Gp = require('geoportal-access-lib');
const corslite = require('@mapbox/corslite');

function latLngToTilePixel(latlng, crs, zoom, tileSize, pixelOrigin) {
  const layerPoint = crs.latLngToPoint(latlng, zoom).floor();
  const tile = layerPoint.divideBy(tileSize).floor();
  const tileCorner = tile.multiplyBy(tileSize).subtract(pixelOrigin);
  const tilePixel = layerPoint.subtract(pixelOrigin).subtract(tileCorner);
  return { tile, tilePixel };
}

module.exports = L.Class.extend({
  options: {},

  initialize(apiKey, map, options) {
    this._apiKey = apiKey;
    this._map = map;
    L.Util.setOptions(this, options);
  },

  fetchAltitudes(latlngs) {
    const geometry = [];
    const promises = [];

    latlngs.forEach((coords) => {
      geometry.push({
        lon: coords.lng,
        lat: coords.lat,
      });
      if (geometry.length === 50) {
        // Launch batch
        promises.push(this._fetchBatchAltitude(geometry.splice(0)));
      }
    });

    if (geometry.length > 0) {
      // Launch last batch
      promises.push(this._fetchBatchAltitude(geometry.splice(0)));
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

  _fetchBatchAltitude(geometry) {
    return new Promise((resolve, reject) => {
      Gp.Services.getAltitude({
        apiKey: this._apiKey,
        sampling: geometry.length,
        positions: geometry,
        onSuccess: (result) => {
          const elevations = [];
          result.elevations.forEach((val) => {
            elevations.push({ lat: val.lat, lng: val.lon, z: val.z });
          });
          resolve(elevations);
        },
        onFailure: (error) => {
          reject(new Error(error.message));
        },
      });
    });
  },

  fetchSlopes(latlngs) {
    const tiles = {};
    const promises = [];
    const crs = this._map ? this._map.options.crs : this.options.crs || L.CRS.EPSG3857;
    const pixelOrigin = this._map ? this._map.getPixelOrigin() : this.options.pixelOrigin;

    latlngs.forEach((coords) => {
      const { tile, tilePixel } = latLngToTilePixel(coords, crs, 16, 256, pixelOrigin);

      if (!(tile.x in tiles)) tiles[tile.x] = {};
      if (!(tile.y in tiles[tile.x])) tiles[tile.x][tile.y] = [[]];

      const arr = tiles[tile.x][tile.y];

      if (arr[arr.length - 1].length > 50) arr.push([]);

      arr[arr.length - 1].push({
        lat: coords.lat,
        lng: coords.lng,
        x: tilePixel.x,
        y: tilePixel.y,
      });
    });

    Object.keys(tiles).forEach((x) => {
      Object.keys(tiles[x]).forEach((y) => {
        tiles[x][y].forEach((batch) => {
          promises.push(this._fetchBatchSlope(x, y, batch));
        });
      });
    });

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

  _fetchBatchSlope(tilex, tiley, coords) {
    const tilematrix = 16;
    const tilerow = tiley;
    const tilecol = tilex;
    let lon = '';
    let lat = '';
    let x = '';
    let y = '';
    const apikey = this._apiKey;

    coords.forEach((coord, idx) => {
      if (idx > 0) {
        lon += '|';
        lat += '|';
        x += '|';
        y += '|';
      }

      lon += coord.lng.toString();
      lat += coord.lat.toString();
      x += coord.x.toString();
      y += coord.y.toString();
    });

    const url = `slope.php?tilematrix=${tilematrix}&tilerow=${tilerow}&tilecol=${tilecol}`
      + `&lon=${lon}&lat=${lat}&x=${x}&y=${y}&apikey=${apikey}`;

    return new Promise((resolve, reject) => {
      corslite(
        url,
        (err, resp) => {
          if (!err) {
            try {
              const data = JSON.parse(resp.responseText);
              if (data.results) {
                const slopes = [];
                data.results.forEach((val) => {
                  slopes.push({ lat: val.lat, lng: val.lon, slope: val.slope });
                });
                resolve(slopes);
              } else {
                reject(new Error("Impossible d'obtenir les données de pentes: résultats invalides"));
              }
            } catch (ex) {
              reject(ex);
            }
          } else {
            try {
              const data = JSON.parse(err.responseText);
              reject(new Error(data.error));
            } catch (ex) {
              reject(ex);
            }
          }
        },
        false,
      );
    });
  },
});
