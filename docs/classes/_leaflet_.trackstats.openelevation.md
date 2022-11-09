**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](../modules/_leaflet_.md) / [TrackStats](../modules/_leaflet_.trackstats.md) / OpenElevation

# Class: OpenElevation

## Hierarchy

* **OpenElevation**

## Implements

* [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)

## Index

### Constructors

* [constructor](_leaflet_.trackstats.openelevation.md#constructor)

### Methods

* [fetchAltitudes](_leaflet_.trackstats.openelevation.md#fetchaltitudes)
* [fetchSlopes](_leaflet_.trackstats.openelevation.md#fetchslopes)

## Constructors

### constructor

\+ **new OpenElevation**(`map`: Map, `options?`: [OpenElevationOptions](../interfaces/_leaflet_.trackstats.openelevationoptions.md)): [OpenElevation](_leaflet_.trackstats.openelevation.md)

#### Parameters:

Name | Type |
------ | ------ |
`map` | Map |
`options?` | [OpenElevationOptions](../interfaces/_leaflet_.trackstats.openelevationoptions.md) |

**Returns:** [OpenElevation](_leaflet_.trackstats.openelevation.md)

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
