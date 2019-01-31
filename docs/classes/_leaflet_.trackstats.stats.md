[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackStats](../modules/_leaflet_.trackstats.md) > [Stats](../classes/_leaflet_.trackstats.stats.md)

# Class: Stats

## Hierarchy

**Stats**

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

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Stats**(latlngs: *[LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[]*, options?: *[StatsOptions](../interfaces/_leaflet_.trackstats.statsoptions.md)*): [Stats](_leaflet_.trackstats.stats.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| latlngs | [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[] |
| `Optional` options | [StatsOptions](../interfaces/_leaflet_.trackstats.statsoptions.md) |

**Returns:** [Stats](_leaflet_.trackstats.stats.md)

___

## Methods

<a id="accumulate"></a>

###  accumulate

▸ **accumulate**(accumulator: *[Stats](_leaflet_.trackstats.stats.md)*): `this`

Adds stats of this instance into accumulator

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| accumulator | [Stats](_leaflet_.trackstats.stats.md) |   |

**Returns:** `this`

___
<a id="getaltmax"></a>

###  getAltMax

▸ **getAltMax**(): `number`

Gets the maximum altitude on the path (in m)

**Returns:** `number`

___
<a id="getaltmin"></a>

###  getAltMin

▸ **getAltMin**(): `number`

Gets the minimum latitude on the path (in m)

**Returns:** `number`

___
<a id="getdistance"></a>

###  getDistance

▸ **getDistance**(): `number`

Gets the cumputed distance, in km

**Returns:** `number`

___
<a id="getheightdiffdown"></a>

###  getHeightDiffDown

▸ **getHeightDiffDown**(): `number`

Gets the negative height difference (in m)

**Returns:** `number`

___
<a id="getheightdiffup"></a>

###  getHeightDiffUp

▸ **getHeightDiffUp**(): `number`

Gets the positive height difference (in m)

**Returns:** `number`

___
<a id="getlatlngs"></a>

###  getLatLngs

▸ **getLatLngs**(): [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[]

**Returns:** [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)[]

___
<a id="getslopemax"></a>

###  getSlopeMax

▸ **getSlopeMax**(): `number`

Gets the maximum slope on the path (i.e. max ascent)

**Returns:** `number`

___
<a id="getslopemin"></a>

###  getSlopeMin

▸ **getSlopeMin**(): `number`

Gets the minimum slope on the path (i.e. max descent)

**Returns:** `number`

___
<a id="getslopeterrainmax"></a>

###  getSlopeTerrainMax

▸ **getSlopeTerrainMax**(): `number` | `undefined`

Gets the maximum slope on the terrain

**Returns:** `number` | `undefined`

___
<a id="getslopeterrainmin"></a>

###  getSlopeTerrainMin

▸ **getSlopeTerrainMin**(): `number` | `undefined`

Gets the minimum slope on the terrain

**Returns:** `number` | `undefined`

___

