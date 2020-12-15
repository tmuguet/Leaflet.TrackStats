**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackStats](../modules/_leaflet_.trackstats.md) / Stats

# Class: Stats

## Hierarchy

* **Stats**

## Index

### Constructors

* [constructor](_leaflet_.trackstats.stats.md#constructor)

### Methods

* [accumulate](_leaflet_.trackstats.stats.md#accumulate)
* [getAltMax](_leaflet_.trackstats.stats.md#getaltmax)
* [getAltMin](_leaflet_.trackstats.stats.md#getaltmin)
* [getDistance](_leaflet_.trackstats.stats.md#getdistance)
* [getHeightDiffDown](_leaflet_.trackstats.stats.md#getheightdiffdown)
* [getHeightDiffUp](_leaflet_.trackstats.stats.md#getheightdiffup)
* [getLatLngs](_leaflet_.trackstats.stats.md#getlatlngs)
* [getSlopeMax](_leaflet_.trackstats.stats.md#getslopemax)
* [getSlopeMin](_leaflet_.trackstats.stats.md#getslopemin)
* [getSlopeTerrainMax](_leaflet_.trackstats.stats.md#getslopeterrainmax)
* [getSlopeTerrainMin](_leaflet_.trackstats.stats.md#getslopeterrainmin)

## Constructors

### constructor

\+ **new Stats**(`latlngs`: [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[], `options?`: [StatsOptions](../interfaces/_leaflet_.trackstats.statsoptions.md)): [Stats](_leaflet_.trackstats.stats.md)

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[] |
`options?` | [StatsOptions](../interfaces/_leaflet_.trackstats.statsoptions.md) |

**Returns:** [Stats](_leaflet_.trackstats.stats.md)

## Methods

### accumulate

▸ **accumulate**(`accumulator`: [Stats](_leaflet_.trackstats.stats.md)): this

Adds stats of this instance into accumulator

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`accumulator` | [Stats](_leaflet_.trackstats.stats.md) |   |

**Returns:** this

___

### getAltMax

▸ **getAltMax**(): number

Gets the maximum altitude on the path (in m)

**Returns:** number

___

### getAltMin

▸ **getAltMin**(): number

Gets the minimum latitude on the path (in m)

**Returns:** number

___

### getDistance

▸ **getDistance**(): number

Gets the cumputed distance, in km

**Returns:** number

___

### getHeightDiffDown

▸ **getHeightDiffDown**(): number

Gets the negative height difference (in m)

**Returns:** number

___

### getHeightDiffUp

▸ **getHeightDiffUp**(): number

Gets the positive height difference (in m)

**Returns:** number

___

### getLatLngs

▸ **getLatLngs**(): [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[]

**Returns:** [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[]

___

### getSlopeMax

▸ **getSlopeMax**(): number

Gets the maximum slope on the path (i.e. max ascent)

**Returns:** number

___

### getSlopeMin

▸ **getSlopeMin**(): number

Gets the minimum slope on the path (i.e. max descent)

**Returns:** number

___

### getSlopeTerrainMax

▸ **getSlopeTerrainMax**(): number \| undefined

Gets the maximum slope on the terrain

**Returns:** number \| undefined

___

### getSlopeTerrainMin

▸ **getSlopeTerrainMin**(): number \| undefined

Gets the minimum slope on the terrain

**Returns:** number \| undefined
