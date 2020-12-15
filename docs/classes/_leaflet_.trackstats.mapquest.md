**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackStats](../modules/_leaflet_.trackstats.md) / Mapquest

# Class: Mapquest

## Hierarchy

* **Mapquest**

## Implements

* [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)

## Index

### Constructors

* [constructor](_leaflet_.trackstats.mapquest.md#constructor)

### Methods

* [fetchAltitudes](_leaflet_.trackstats.mapquest.md#fetchaltitudes)
* [fetchSlopes](_leaflet_.trackstats.mapquest.md#fetchslopes)

## Constructors

### constructor

\+ **new Mapquest**(`apiKey`: String, `map`: Map, `options?`: [MapquestOptions](../interfaces/_leaflet_.trackstats.mapquestoptions.md)): [Mapquest](_leaflet_.trackstats.mapquest.md)

#### Parameters:

Name | Type |
------ | ------ |
`apiKey` | String |
`map` | Map |
`options?` | [MapquestOptions](../interfaces/_leaflet_.trackstats.mapquestoptions.md) |

**Returns:** [Mapquest](_leaflet_.trackstats.mapquest.md)

## Methods

### fetchAltitudes

▸ **fetchAltitudes**(`latlngs`: LatLng[], `eventTarget?`: Evented): Promise\<[LatLngLiteralAltitude](../interfaces/_leaflet_.trackstats.latlngliteralaltitude.md)[]>

*Implementation of [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)*

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | LatLng[] |
`eventTarget?` | Evented |

**Returns:** Promise\<[LatLngLiteralAltitude](../interfaces/_leaflet_.trackstats.latlngliteralaltitude.md)[]>

___

### fetchSlopes

▸ **fetchSlopes**(`latlngs`: LatLng[], `eventTarget?`: Evented): Promise\<[LatLngLiteralSlope](../interfaces/_leaflet_.trackstats.latlngliteralslope.md)[]>

*Implementation of [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)*

Unsupported

**`throws`** Error

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | LatLng[] |
`eventTarget?` | Evented |

**Returns:** Promise\<[LatLngLiteralSlope](../interfaces/_leaflet_.trackstats.latlngliteralslope.md)[]>
