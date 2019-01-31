[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackStats](../modules/_leaflet_.trackstats.md) > [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)

# Interface: IFetcher

*__fires__*: TrackStats:fetched Fired when some data has been fetched

## Hierarchy

 `any`

**↳ IFetcher**

## Implemented by

* [Geoportail](../classes/_leaflet_.trackstats.geoportail.md)
* [Mapquest](../classes/_leaflet_.trackstats.mapquest.md)

## Index

### Methods

* [fetchAltitudes](_leaflet_.trackstats.ifetcher.md#fetchaltitudes)
* [fetchSlopes](_leaflet_.trackstats.ifetcher.md#fetchslopes)

---

## Methods

<a id="fetchaltitudes"></a>

###  fetchAltitudes

▸ **fetchAltitudes**(latlngs: *`LatLng`[]*, eventTarget?: *`Evented`*): `Promise`<[LatLngLiteralAltitude](_leaflet_.trackstats.latlngliteralaltitude.md)[]>

**Parameters:**

| Name | Type |
| ------ | ------ |
| latlngs | `LatLng`[] |
| `Optional` eventTarget | `Evented` |

**Returns:** `Promise`<[LatLngLiteralAltitude](_leaflet_.trackstats.latlngliteralaltitude.md)[]>

___
<a id="fetchslopes"></a>

###  fetchSlopes

▸ **fetchSlopes**(latlngs: *`LatLng`[]*, eventTarget?: *`Evented`*): `Promise`<[LatLngLiteralSlope](_leaflet_.trackstats.latlngliteralslope.md)[]>

**Parameters:**

| Name | Type |
| ------ | ------ |
| latlngs | `LatLng`[] |
| `Optional` eventTarget | `Evented` |

**Returns:** `Promise`<[LatLngLiteralSlope](_leaflet_.trackstats.latlngliteralslope.md)[]>

___

