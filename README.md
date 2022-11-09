# Leaflet TrackStats

Leaflet TrackStats is a plugin for [Leaflet](http://leafletjs.com/) to compute altitude/slope statistics on paths.

`L.TrackStats` extends Leaflet's Polyline objects to include methods to compute the stats. It also integrates nicely with [Leaflet TrackDrawer](https://github.com/tmuguet/Leaflet.TrackDrawer).

This plugin supports [GeoPortail](https://geoservices.ign.fr/documentation/services/api-et-services-ogc/calcul-altimetrique-rest), [Open-Elevation](https://www.open-elevation.com/) and [Open Topo Data](https://www.opentopodata.org/) as data providers, but it can easily be extended for new data providers by implementing the `IFetcher` interface.

## Demo

A real-case usage of this plugin is for [map2gpx](http://map2gpx.eu/).

## API

See [doc](docs/modules/_leaflet_.md).
