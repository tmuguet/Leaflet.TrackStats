[Leaflet.TrackDrawer](../README.md) > ["leaflet"](../modules/_leaflet_.md) > [TrackStats](../modules/_leaflet_.trackstats.md)

# Module: TrackStats

TrackStats

Usage sample:

```javascript
var trackstats = L.TrackStats.geoportail('<key>', map);
var polyline = L.polyline([...]).addTo(map);

polyline
.fetchAltitude(trackstats)
.then(() => {
var stats = polyline.computeStats();

var data = stats.getLatLngs().map(x => L.latLng(x.lat, x.lng, x.z));
var hotline = L.hotline(data, {
min: stats.getAltMin(),
max: stats.getAltMax(),
});
polyline.remove();
hotline
.addTo(map)
.bindTooltip('This hotline displays altitude (the redder the higher)')
.bindPopup(
'Distance: ' +
stats.getDistance() +
'km<br>' +
'Alt min: ' +
stats.getAltMin() +
'm - alt max: ' +
stats.getAltMax() +
'm<br>' +
'Height diff up: ' +
stats.getHeightDiffUp() +
'm - height diff down: ' +
stats.getHeightDiffDown() +
'm'
)
.openPopup();
})
.catch(err => {
polyline.bindTooltip(err);
console.log(err);
});

// With Leaflet TrackDrawer
var track = L.TrackDrawer.track({
router: L.Routing.geoPortail('<key>', { profile: 'Pieton' }),
fetcher: L.TrackStats.geoportail('<key>', map),
}).addTo(map);

track.on('TrackDrawer:statsdone', () => {
track.getNodes().forEach((n) => {
n.markers.forEach((node) => {
if (node.getPopup() === undefined) {
node.bindPopup('<>');
}
node.setPopupContent(
`<ul>`
+ `<li>Altitude: ${Math.round(node._stats.z)}m</li>`
+ `<li>Distance from start: ${Math.round(node._stats.distance * 100) / 100}km</li>`
+ `<li>Distance from last stopover: ${Math.round(node._stats.startingDistance * 100)
/ 100}km</li></ul>`,
);
});
});

track.getSteps().forEach((g) => {
var c = g.container;
if (c.getPopup() === undefined) {
c.bindPopup('<>');
}
c.setPopupContent(
`<ul>`
+ `<li>Altitude max: ${Math.round(c._stats.getAltMax())}m</li>`
+ `<li>Positive height difference: ${Math.round(c._stats.getHeightDiffUp())}m</li>`
+ `<li>Altitufe min: ${Math.round(c._stats.getAltMin())}m</li>`
+ `<li>Negative height difference: ${Math.round(c._stats.getHeightDiffDown())}m</li>`
+ `<li>Distance: ${Math.round(c._stats.getDistance() * 100) / 100}km</li></ul>`,
);
});
```

## Index

### Modules

* [cache](_leaflet_.trackstats.cache.md)

### Classes

* [Geoportail](../classes/_leaflet_.trackstats.geoportail.md)
* [Mapquest](../classes/_leaflet_.trackstats.mapquest.md)
* [Stats](../classes/_leaflet_.trackstats.stats.md)

### Interfaces

* [EventPayload](../interfaces/_leaflet_.trackstats.eventpayload.md)
* [GeoportailOptions](../interfaces/_leaflet_.trackstats.geoportailoptions.md)
* [IFetcher](../interfaces/_leaflet_.trackstats.ifetcher.md)
* [LatLngLiteralAltitude](../interfaces/_leaflet_.trackstats.latlngliteralaltitude.md)
* [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)
* [LatLngLiteralSlope](../interfaces/_leaflet_.trackstats.latlngliteralslope.md)
* [MapquestOptions](../interfaces/_leaflet_.trackstats.mapquestoptions.md)
* [StatsOptions](../interfaces/_leaflet_.trackstats.statsoptions.md)

### Functions

* [geoportail](_leaflet_.trackstats.md#geoportail-1)
* [mapquest](_leaflet_.trackstats.md#mapquest-1)

---

## Functions

<a id="geoportail-1"></a>

###  geoportail

▸ **geoportail**(apiKey: *`String`*, map: *`Map`*, options?: *[GeoportailOptions](../interfaces/_leaflet_.trackstats.geoportailoptions.md)*): [Geoportail](../classes/_leaflet_.trackstats.geoportail.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| apiKey | `String` |
| map | `Map` |
| `Optional` options | [GeoportailOptions](../interfaces/_leaflet_.trackstats.geoportailoptions.md) |

**Returns:** [Geoportail](../classes/_leaflet_.trackstats.geoportail.md)

___
<a id="mapquest-1"></a>

###  mapquest

▸ **mapquest**(apiKey: *`String`*, map: *`Map`*, options?: *[MapquestOptions](../interfaces/_leaflet_.trackstats.mapquestoptions.md)*): [Mapquest](../classes/_leaflet_.trackstats.mapquest.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| apiKey | `String` |
| map | `Map` |
| `Optional` options | [MapquestOptions](../interfaces/_leaflet_.trackstats.mapquestoptions.md) |

**Returns:** [Mapquest](../classes/_leaflet_.trackstats.mapquest.md)

___

