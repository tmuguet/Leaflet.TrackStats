const L = require('leaflet');
const stats = require('./stats');

if (L.TrackDrawer !== undefined) {
  L.TrackDrawer.Track.include({
    _steps: undefined,
    _total: undefined,
    _i: 0,

    _bindEvent() {
      this.on('TrackDrawer:done', (e) => {
        this._finalizeRoute(this.options.fetcher);
      });
    },

    _finalizeRoute(fetcher) {
      const routes = [];
      this._i += 1;

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

      return new Promise(async (resolve, reject) => {
        try {
          const promises = [];
          routes.forEach((r) => {
            promises.push(r.fetchInfos(fetcher, this).then(() => r.computeStats()));
          });

          await Promise.all(promises);
          this._i -= 1;
          if (this._i === 0) {
            // Don't compute stats if this._i changed because the track is out-of-date
            this._computeStats();
          }
          resolve();
        } catch (ex) {
          this._i -= 1;
          reject(ex);
        }
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
      this._total = new stats([]);
      let local = new stats([]);

      let currentNode = this._getNode(this._firstNodeId);

      this._nodesContainers.forEach((nodeContainer, idx) => {
        currentNode._stats = {
          startingDistance: local.getDistance(),
          distance: this._total.getDistance(),
          z: currentNode.getLatLng().getCachedInfos().z,
        };

        local = new stats([]);
        local.startingDistance = this._total.getDistance();

        do {
          const { nextEdge, nextNode } = this._getNext(currentNode);
          if (currentNode === undefined || nextEdge === undefined) {
            break;
          }

          nextEdge
            .getStats()
            .accumulate(this._total)
            .accumulate(local);
          currentNode = nextNode;

          currentNode._stats = {
            startingDistance: local.getDistance(),
            distance: this._total.getDistance(),
            z: currentNode.getLatLng().getCachedInfos().z,
          };
        } while (currentNode.options.type !== 'stopover');

        const edgeContainer = this._edgesContainers[idx];
        edgeContainer._stats = local;
        this._steps.push(local);
      });

      if (this._fireEvents) this.fire('TrackDrawer:statsdone', {});

      return this;
    },
  });

  L.TrackDrawer.Track.addInitHook('_bindEvent');
}
