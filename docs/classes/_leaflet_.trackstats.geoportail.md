**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackStats](../modules/_leaflet_.trackstats.md) / Geoportail

# Class: Geoportail

## Hierarchy

* **Geoportail**

## Implements

* [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)

## Index

### Constructors

* [constructor](_leaflet_.trackstats.geoportail.md#constructor)

### Methods

* [fetchAltitudes](_leaflet_.trackstats.geoportail.md#fetchaltitudes)
* [fetchSlopes](_leaflet_.trackstats.geoportail.md#fetchslopes)

## Constructors

### constructor

\+ **new Geoportail**(`apiKey`: String, `map`: Map, `options?`: [GeoportailOptions](../interfaces/_leaflet_.trackstats.geoportailoptions.md)): [Geoportail](_leaflet_.trackstats.geoportail.md)

#### Parameters:

Name | Type |
------ | ------ |
`apiKey` | String |
`map` | Map |
`options?` | [GeoportailOptions](../interfaces/_leaflet_.trackstats.geoportailoptions.md) |

**Returns:** [Geoportail](_leaflet_.trackstats.geoportail.md)

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

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | LatLng[] |
`eventTarget?` | Evented |

**Returns:** Promise\<[LatLngLiteralSlope](../interfaces/_leaflet_.trackstats.latlngliteralslope.md)[]>
