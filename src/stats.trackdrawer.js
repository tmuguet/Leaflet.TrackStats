const L = require('leaflet');
const Stats = require('./stats');

if (L.TrackDrawer !== undefined) {
  L.TrackDrawer.Track.include({
    _steps: undefined,
    _total: undefined,
    _i: 0,

    _bindEvent() {
      this.on('TrackDrawer:start', () => {
        this._i += 1;
      });
      this.on('TrackDrawer:failed', (e) => {
        this._i -= 1;
        if (this._fireEvents) this.fire('TrackDrawer:statsfailed', { message: e.message });
      });
      this.on('TrackDrawer:done', () => {
        this._finalizeRoute(this.options.fetcher).catch((e) => {
          this._i -= 1;
          if (this._fireEvents) this.fire('TrackDrawer:statsfailed', { message: e.message });
        });
      });
    },

    _finalizeRoute(fetcher) {
      const routes = [];

      let currentNode = this._getNode(this._firstNodeId);

      this._nodesContainers.forEach(() => {
        do {
          const { nextEdge, nextNode } = this._getNext(currentNode);
          if (currentNode === undefined || nextEdge === undefined) {
            break;
          }

          routes.push(nextEdge);

          currentNode = nextNode;
        } while (currentNode.options.type !== 'stopover');
      });

      return new Promise((resolve, reject) => {
        const promises = [];
        routes.forEach((r) => {
          promises.push(r.fetchInfos(fetcher, this).then(() => r.computeStats()));
        });

        Promise.all(promises).then(() => {
          this._i -= 1;
          if (this._i === 0) {
            // Compute stats only if this._i is back to 0 (otherwise the track is out-of-date)
            this._computeStats();
          }
          resolve();
        }).catch((e) => reject(e));
      });
    },

    getStatsTotal() {
      return this._total;
    },
    getStatsSteps() {
      return this._steps;
    },

    _computeStats() {
      this._steps = [];
      this._total = new Stats([]);
      let local = new Stats([]);

      let currentNode = this._getNode(this._firstNodeId);

      if (currentNode !== undefined) {
        this._nodesContainers.forEach((nodeContainer, idx) => {
          currentNode._stats = {
            startingDistance: local.getDistance(),
            distance: this._total.getDistance(),
            z: currentNode.getLatLng().getCachedInfos().z,
          };

          local = new Stats([]);
          local.startingDistance = this._total.getDistance();

          do {
            const { nextEdge, nextNode } = this._getNext(currentNode);
            if (currentNode === undefined || nextEdge === undefined) {
              break;
            }

            const stats = nextEdge.getStats();
            if (stats !== undefined) {
              stats.accumulate(this._total).accumulate(local);
            }
            currentNode = nextNode;

            currentNode._stats = {
              startingDistance: local.getDistance(),
              distance: this._total.getDistance(),
              z: currentNode.getLatLng().getCachedInfos().z,
            };
          } while (currentNode.options.type !== 'stopover');

          const edgeContainer = this._edgesContainers.get(idx);
          edgeContainer._stats = local;
          this._steps.push(local);
        });
      }

      if (this._fireEvents) this.fire('TrackDrawer:statsdone', {});

      return this;
    },
  });

  L.TrackDrawer.Track.addInitHook('_bindEvent');
}
