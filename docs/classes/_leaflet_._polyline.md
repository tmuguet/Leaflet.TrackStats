**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / \_Polyline

# Class: \_Polyline

Extends Leaflet's Polyline

## Hierarchy

* **_Polyline**

## Index

### Methods

* [computeStats](_leaflet_._polyline.md#computestats)
* [fetchAltitude](_leaflet_._polyline.md#fetchaltitude)
* [fetchInfos](_leaflet_._polyline.md#fetchinfos)
* [fetchSlope](_leaflet_._polyline.md#fetchslope)
* [getStats](_leaflet_._polyline.md#getstats)

## Methods

### computeStats

▸ **computeStats**(): [Stats](_leaflet_.trackstats.stats.md)

Computes stats on the track.

Should be called only when fetching has completed.

**Returns:** [Stats](_leaflet_.trackstats.stats.md)

___

### fetchAltitude

▸ **fetchAltitude**(`fetcher`: [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md), `eventTarget?`: Evented): Promise\<void>

**`fires`** TrackStats:fetching Fired when fetching data has started - sends EventPayload with `datatype=altitudes`

**`fires`** TrackStats:done Fired when fetching data has completed - sends EventPayload with `datatype=altitudes`

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`fetcher` | [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md) |  |
`eventTarget?` | Evented | Object to notify events to |

**Returns:** Promise\<void>

___

### fetchInfos

▸ **fetchInfos**(`fetcher`: [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md), `eventTarget?`: Evented): Promise\<void>

Shorthand for `fetchAltitude` and `fetchSlope`.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`fetcher` | [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md) |  |
`eventTarget?` | Evented | Object to notify events to  |

**Returns:** Promise\<void>

___

### fetchSlope

▸ **fetchSlope**(`fetcher`: [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md), `eventTarget?`: Evented): Promise\<void>

**`fires`** TrackStats:fetching Fired when fetching data has started - sends EventPayload with `datatype=slopes`

**`fires`** TrackStats:done Fired when fetching data has completed - sends EventPayload with `datatype=slopes`

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`fetcher` | [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md) |  |
`eventTarget?` | Evented | Object to notify events to |

**Returns:** Promise\<void>

___

### getStats

▸ **getStats**(): [Stats](_leaflet_.trackstats.stats.md)

**Returns:** [Stats](_leaflet_.trackstats.stats.md)
