import * as L from 'leaflet';

declare module 'leaflet' {
  /**
   * TrackStats
   *
   * Usage sample:
   * ```javascript
var trackstats = L.TrackStats.geoportail('<key>', map);
var polyline = L.polyline([...]).addTo(map);

polyline
  .fetchAltitude(trackstats)
  .then(() => {
    var stats = polyline.computeStats();

    var data = stats.getLatLngs().map(x => L.latLng(x.lat, x.lng, x.z));
    var hotline = L.hotline(data, {
      min: stats.getAltMin(),
      max: stats.getAltMax(),
    });
    polyline.remove();
    hotline
      .addTo(map)
      .bindTooltip('This hotline displays altitude (the redder the higher)')
      .bindPopup(
        'Distance: ' +
          stats.getDistance() +
          'km<br>' +
          'Alt min: ' +
          stats.getAltMin() +
          'm - alt max: ' +
          stats.getAltMax() +
          'm<br>' +
          'Height diff up: ' +
          stats.getHeightDiffUp() +
          'm - height diff down: ' +
          stats.getHeightDiffDown() +
          'm'
      )
      .openPopup();
  })
  .catch(err => {
    polyline.bindTooltip(err);
    console.log(err);
  });

// With Leaflet TrackDrawer
var track = L.TrackDrawer.track({
  router: L.Routing.geoPortail('<key>', { profile: 'Pieton' }),
  fetcher: L.TrackStats.geoportail('<key>', map),
}).addTo(map);

track.on('TrackDrawer:statsdone', () => {
  track.getNodes().forEach((n) => {
    n.markers.forEach((node) => {
      if (node.getPopup() === undefined) {
        node.bindPopup('<>');
      }
      node.setPopupContent(
        `<ul>`
          + `<li>Altitude: ${Math.round(node._stats.z)}m</li>`
          + `<li>Distance from start: ${Math.round(node._stats.distance * 100) / 100}km</li>`
          + `<li>Distance from last stopover: ${Math.round(node._stats.startingDistance * 100)
            / 100}km</li></ul>`,
      );
    });
  });

  track.getSteps().forEach((g) => {
    var c = g.container;
    if (c.getPopup() === undefined) {
      c.bindPopup('<>');
    }
    c.setPopupContent(
      `<ul>`
        + `<li>Altitude max: ${Math.round(c._stats.getAltMax())}m</li>`
        + `<li>Positive height difference: ${Math.round(c._stats.getHeightDiffUp())}m</li>`
        + `<li>Altitufe min: ${Math.round(c._stats.getAltMin())}m</li>`
        + `<li>Negative height difference: ${Math.round(c._stats.getHeightDiffDown())}m</li>`
        + `<li>Distance: ${Math.round(c._stats.getDistance() * 100) / 100}km</li></ul>`,
    );
  });
```
   */
  module TrackStats {
    /**
     *
     * @fires TrackStats:fetched Fired when some data has been fetched
     */
    interface IFetcher extends Class {
      fetchAltitudes(latlngs: LatLng[], eventTarget?: Evented): Promise<LatLngLiteralAltitude[]>;
      fetchSlopes(latlngs: LatLng[], eventTarget?: Evented): Promise<LatLngLiteralSlope[]>;
    }

    interface LatLngLiteralAltitude extends LatLngLiteral {
      z?: number;
    }

    interface LatLngLiteralSlope extends LatLngLiteral {
      slope?: number;
    }

    interface LatLngLiteralExtended extends LatLngLiteral {
      z?: number;
      slope?: number;
    }

    interface EventPayload {
      datatype: String;
      size: number;
    }

    namespace cache {
      enum Type {
        /** Altitude */
        z,
        /** Slope */
        slope,
      }

      /**
       * Sets the precision.
       *
       * Values passed to `add` or `get` will be rounded to that precision.
       * @param p Precision
       */
      function setPrecision(p: number): void;

      /**
       * Returns whether this value is cached or not.
       * @param t  Type of data to search for.
       * @param coords Data
       */
      function has(t: Type, coords: LatLng): boolean;
      /**
       * Adds a value in the cache.
       * @param t  Type of data to add. Property `t` of `coords` must be defined
       * @param coords Data
       */
      function add(t: Type, coords: LatLng): void;
      /**
       * Get a value from the cache.
       * @param t  Type of data to get.
       * @param coords Data
       */
      function get(t: Type, coords: LatLng): number;

      /**
       * Shorthand for `has('z', coords)`
       * @param coords Data
       */
      function hasZ(coords: LatLng): boolean;
      /**
       * Shorthand for `has('slope', coords)`
       * @param coords Data
       */
      function hasSlope(coords: LatLng): boolean;

      /**
       * Shorthand for `add('z', coords)`
       * @param coords Data
       */
      function addZ(coords: LatLng): void;
      /**
       * Shorthand for `add('slope', coords)`
       * @param coords Data
       */
      function addSlope(coords: LatLng): void;

      /**
       * Gets all data cached for these coordinates
       * @param coords Data
       */
      function getAll(coords: LatLng): LatLngLiteralExtended;

      /**
       * Clears the cache
       */
      function clear(): void;
    }

    interface StatsOptions {}
    class Stats {
      constructor(latlngs: LatLngLiteralExtended[], options?: StatsOptions);

      /**
       * Adds stats of this instance into accumulator
       * @param accumulator
       */
      accumulate(accumulator: Stats): this;

      getLatLngs(): LatLngLiteralExtended[];

      /** Gets the cumputed distance, in km */
      getDistance(): number;

      /** Gets the minimum latitude on the path (in m) */
      getAltMin(): number;

      /** Gets the maximum altitude on the path (in m) */
      getAltMax(): number;

      /** Gets the minimum slope on the path (i.e. max descent) */
      getSlopeMin(): number;

      /** Gets the maximum slope on the path (i.e. max ascent) */
      getSlopeMax(): number;

      /** Gets the positive height difference (in m) */
      getHeightDiffUp(): number;

      /** Gets the negative height difference (in m) */
      getHeightDiffDown(): number;

      /** Gets the minimum slope on the terrain */
      getSlopeTerrainMin(): number | undefined;

      /** Gets the maximum slope on the terrain */
      getSlopeTerrainMax(): number | undefined;
    }

    interface GeoportailOptions {}
    class Geoportail implements IFetcher {
      constructor(apiKey: String, map: Map, options?: GeoportailOptions);

      fetchAltitudes(latlngs: LatLng[], eventTarget?: Evented): Promise<LatLngLiteralAltitude[]>;

      fetchSlopes(latlngs: LatLng[], eventTarget?: Evented): Promise<LatLngLiteralSlope[]>;
    }
    function geoportail(apiKey: String, map: Map, options?: GeoportailOptions): Geoportail;

    interface MapquestOptions {}
    class Mapquest implements IFetcher {
      constructor(apiKey: String, map: Map, options?: MapquestOptions);

      fetchAltitudes(latlngs: LatLng[], eventTarget?: Evented): Promise<LatLngLiteralAltitude[]>;

      /**
       * Unsupported
       * @param latlngs
       * @param eventTarget
       * @throws Error
       */
      fetchSlopes(latlngs: LatLng[], eventTarget?: Evented): Promise<LatLngLiteralSlope[]>;
    }
    function mapquest(apiKey: String, map: Map, options?: MapquestOptions): Mapquest;
  }

  /**
   * Extends Leaflet's Polyline
   */
  class _Polyline {
    getStats(): TrackStats.Stats;

    /**
     *
     * @param fetcher
     * @param eventTarget Object to notify events to
     * @fires TrackStats:fetching Fired when fetching data has started - sends EventPayload with `datatype=altitudes`
     * @fires TrackStats:done Fired when fetching data has completed - sends EventPayload with `datatype=altitudes`
     */
    fetchAltitude(fetcher: TrackStats.IFetcher, eventTarget?: Evented): Promise<void>;

    /**
     *
     * @param fetcher
     * @param eventTarget Object to notify events to
     * @fires TrackStats:fetching Fired when fetching data has started - sends EventPayload with `datatype=slopes`
     * @fires TrackStats:done Fired when fetching data has completed - sends EventPayload with `datatype=slopes`
     */
    fetchSlope(fetcher: TrackStats.IFetcher, eventTarget?: Evented): Promise<void>;

    /**
     * Shorthand for `fetchAltitude` and `fetchSlope`.
     * @param fetcher
     * @param eventTarget Object to notify events to
     */
    fetchInfos(fetcher: TrackStats.IFetcher, eventTarget?: Evented): Promise<void>;

    /**
     * Computes stats on the track.
     *
     * Should be called only when fetching has completed.
     */
    computeStats(): TrackStats.Stats;
  }

  /**
   * Extends Leaflet's LatLng
   */
  class _LatLng {
    getCachedInfos(): TrackStats.LatLngLiteralExtended;
  }

  /** Extends TrackDrawer if available */
  module TrackDrawer {
    /** Adds new options to TrackDrawer.Track */
    interface TrackOptions {
      /** Instance used to fetch statistics */
      fetcher: TrackStats.IFetcher;
    }

    /**
     * Extends TrackDrawer.Track if available
     *
     * @fires TrackDrawer:statsdone Fired when computation is done
     * @fires TrackDrawer:statsfailed Fired if computation has failed
     */
    class Track {
      /**
       * Gets stats for the whole track
       */
      getStatsTotal(): TrackStats.Stats;

      /**
       * Gets stats for each segments of the tracks (e.g. between stop-overs)
       */
      getStatsSteps(): TrackStats.Stats[];
    }
  }
}
