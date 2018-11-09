L.Map.include({
  loadAsPromise() {
    const _this = this;
    return $.Deferred(function () {
      _this.on('load', () => this.resolve());
    });
  },

  removeAsPromise() {
    const _this = this;
    return $.Deferred(function () {
      _this.on('unload', () => this.resolve());
      _this.remove();
    });
  },
});

function getLatLngsSmallBatch() {
  return [
    L.latLng(44.971296, 6.070504),
    L.latLng(44.971309, 6.070449),
    L.latLng(44.971256, 6.070424),
    L.latLng(44.971059, 6.0703),
    L.latLng(44.971166, 6.070658),
    L.latLng(44.971287, 6.070956),
  ];
}

$('body').append('<div id="map" style="width: 100%; height: 300px;"></div>');

const assert = chai.assert;
const expect = chai.expect;
