**[Leaflet.TrackDrawer](../README.md)**

> [Globals](../README.md) / ["leaflet"](_leaflet_.md) / [TrackStats](_leaflet_.trackstats.md) / cache

# Namespace: cache

## Index

### Enumerations

* [Type](../enums/_leaflet_.trackstats.cache.type.md)

### Functions

* [add](_leaflet_.trackstats.cache.md#add)
* [addSlope](_leaflet_.trackstats.cache.md#addslope)
* [addZ](_leaflet_.trackstats.cache.md#addz)
* [clear](_leaflet_.trackstats.cache.md#clear)
* [get](_leaflet_.trackstats.cache.md#get)
* [getAll](_leaflet_.trackstats.cache.md#getall)
* [has](_leaflet_.trackstats.cache.md#has)
* [hasSlope](_leaflet_.trackstats.cache.md#hasslope)
* [hasZ](_leaflet_.trackstats.cache.md#hasz)
* [setPrecision](_leaflet_.trackstats.cache.md#setprecision)

## Functions

### add

▸ **add**(`t`: [Type](../enums/_leaflet_.trackstats.cache.type.md), `coords`: LatLng): void

Adds a value in the cache.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`t` | [Type](../enums/_leaflet_.trackstats.cache.type.md) | Type of data to add. Property `t` of `coords` must be defined |
`coords` | LatLng | Data  |

**Returns:** void

___

### addSlope

▸ **addSlope**(`coords`: LatLng): void

Shorthand for `add('slope', coords)`

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`coords` | LatLng | Data  |

**Returns:** void

___

### addZ

▸ **addZ**(`coords`: LatLng): void

Shorthand for `add('z', coords)`

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`coords` | LatLng | Data  |

**Returns:** void

___

### clear

▸ **clear**(): void

Clears the cache

**Returns:** void

___

### get

▸ **get**(`t`: [Type](../enums/_leaflet_.trackstats.cache.type.md), `coords`: LatLng): number

Get a value from the cache.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`t` | [Type](../enums/_leaflet_.trackstats.cache.type.md) | Type of data to get. |
`coords` | LatLng | Data  |

**Returns:** number

___

### getAll

▸ **getAll**(`coords`: LatLng): [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)

Gets all data cached for these coordinates

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`coords` | LatLng | Data  |

**Returns:** [LatLngLiteralExtended](../interfaces/_leaflet_.trackstats.latlngliteralextended.md)

___

### has

▸ **has**(`t`: [Type](../enums/_leaflet_.trackstats.cache.type.md), `coords`: LatLng): boolean

Returns whether this value is cached or not.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`t` | [Type](../enums/_leaflet_.trackstats.cache.type.md) | Type of data to search for. |
`coords` | LatLng | Data  |

**Returns:** boolean

___

### hasSlope

▸ **hasSlope**(`coords`: LatLng): boolean

Shorthand for `has('slope', coords)`

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`coords` | LatLng | Data  |

**Returns:** boolean

___

### hasZ

▸ **hasZ**(`coords`: LatLng): boolean

Shorthand for `has('z', coords)`

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`coords` | LatLng | Data  |

**Returns:** boolean

___

### setPrecision

▸ **setPrecision**(`p`: number): void

Sets the precision.

Values passed to `add` or `get` will be rounded to that precision.

#### Parameters:

Name | Type | Description |
------ | ------ | ------ |
`p` | number | Precision  |

**Returns:** void
