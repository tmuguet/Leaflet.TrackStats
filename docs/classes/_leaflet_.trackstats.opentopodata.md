**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackStats](../modules/_leaflet_.trackstats.md) / OpenTopoData

# Class: OpenTopoData

## Hierarchy

* **OpenTopoData**

## Implements

* [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)

## Index

### Constructors

* [constructor](_leaflet_.trackstats.opentopodata.md#constructor)

### Methods

* [fetchAltitudes](_leaflet_.trackstats.opentopodata.md#fetchaltitudes)
* [fetchSlopes](_leaflet_.trackstats.opentopodata.md#fetchslopes)

## Constructors

### constructor

\+ **new OpenTopoData**(`server`: string, `map`: Map, `options?`: [OpenTopoDataOptions](../interfaces/_leaflet_.trackstats.opentopodataoptions.md)): [OpenTopoData](_leaflet_.trackstats.opentopodata.md)

#### Parameters:

Name | Type |
------ | ------ |
`server` | string |
`map` | Map |
`options?` | [OpenTopoDataOptions](../interfaces/_leaflet_.trackstats.opentopodataoptions.md) |

**Returns:** [OpenTopoData](_leaflet_.trackstats.opentopodata.md)

## Methods

### fetchAltitudes

▸ **fetchAltitudes**(`latlngs`: LatLng[], `eventTarget?`: Evented): Promise<[LatLngLiteralAltitude](../interfaces/_leaflet_.trackstats.latlngliteralaltitude.md)[]\>

*Implementation of [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)*

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | LatLng[] |
`eventTarget?` | Evented |

**Returns:** Promise<[LatLngLiteralAltitude](../interfaces/_leaflet_.trackstats.latlngliteralaltitude.md)[]\>

___

### fetchSlopes

▸ **fetchSlopes**(`latlngs`: LatLng[], `eventTarget?`: Evented): Promise<[LatLngLiteralSlope](../interfaces/_leaflet_.trackstats.latlngliteralslope.md)[]\>

*Implementation of [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)*

Unsupported

**`throws`** Error

#### Parameters:

Name | Type |
------ | ------ |
`latlngs` | LatLng[] |
`eventTarget?` | Evented |

**Returns:** Promise<[LatLngLiteralSlope](../interfaces/_leaflet_.trackstats.latlngliteralslope.md)[]\>
