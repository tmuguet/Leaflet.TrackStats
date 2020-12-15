**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackDrawer](../modules/_leaflet_.trackdrawer.md) / Track

# Class: Track

Extends TrackDrawer.Track if available

**`fires`** TrackDrawer:statsdone Fired when computation is done

**`fires`** TrackDrawer:statsfailed Fired if computation has failed

## Hierarchy

* **Track**

## Index

### Methods

* [getStatsSteps](_leaflet_.trackdrawer.track.md#getstatssteps)
* [getStatsTotal](_leaflet_.trackdrawer.track.md#getstatstotal)

## Methods

### getStatsSteps

▸ **getStatsSteps**(): [Stats](_leaflet_.trackstats.stats.md)[]

Gets stats for each segments of the tracks (e.g. between stop-overs)

**Returns:** [Stats](_leaflet_.trackstats.stats.md)[]

___

### getStatsTotal

▸ **getStatsTotal**(): [Stats](_leaflet_.trackstats.stats.md)

Gets stats for the whole track

**Returns:** [Stats](_leaflet_.trackstats.stats.md)
