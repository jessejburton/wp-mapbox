const MAPBOXGL_ACCESS_TOKEN = 'pk.eyJ1IjoiamVzc2VqYnVydG9uIiwiYSI6ImNrMm44bzA5djBxYXIzZHQ1MTE5enoyMzcifQ.jZIKelee2Oq5uE-0Vti9_Q'

function init() {

  /*
    (*) the variable data here comes in from the shortcode using
    wp_localize_script( 'wp-mapbox-local-script', 'features', $features );
    You can find the code in in wp-mapbox.php
  */
  const features = dataToFeatures(data); // (*)
  const layer = dataToLayer(features, "WPMapBox");

  loadMap(layer);

  console.log(features);
}
init();

function loadMap(layer) {
  mapboxgl.accessToken = MAPBOXGL_ACCESS_TOKEN;

  var map = new mapboxgl.Map({
    container: 'mapbox_map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-114.0719, 51.0447],
    zoom: 8
  });

  map.on('load', function () {
    // TODO ~HOVER DISPLAY - let _popup = null;

    map.loadImage(plugin_url + 'icons/curling.png', function (error, image) {
      if (error) throw error;
      map.addImage('cat', image);
      map.addLayer(layer);

      map.on('click', 'WPMapBox', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'WPMapBox', function (e) {
        map.getCanvas().style.cursor = 'pointer';

        /* Working on adding a hover display
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        _popup = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);*/
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'WPMapBox', function () {
        map.getCanvas().style.cursor = '';
        // TODO ~HOVER DISPLAY - _popup.remove();
      });
    });
  });
}

function dataToLayer(features, id) {

  const geoJson = {
    "id": id,
    "type": 'symbol',
    "source": {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "features": features
      }
    },
    "layout": {
      "icon-image": "cat",
      "icon-size": 1
    }
  }

  return geoJson;

}

function dataToFeatures(data) {

  const features = [];

  for (f in data) {
    let feature = data[f];
    let latitude = feature.latitude;
    let longitude = feature.longitude;
    let image = feature.image;
    let title = feature.title;
    let details = feature.details;
    let link = feature.link;

    if (latitude !== null && longitude !== null) {
      features.push({
        "type": "Feature",
        "properties": {
          "description": `<h1 class="heading">${title}</h1><div class="link"><a href="${link}">Find Out More</a></div>
          `,
          "icon": "marker"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [parseFloat(longitude), parseFloat(latitude)]
        }
      })
    }
  }

  return features;
}
