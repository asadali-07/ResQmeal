import Map, { Marker } from "react-map-gl";

function MapComponent() {

  return (

    <Map
      initialViewState={{
        longitude: 77.3910,
        latitude: 28.5355,
        zoom: 12
      }}

      style={{
        width: "100%",
        height: "500px"
      }}

      mapStyle="mapbox://styles/mapbox/streets-v11"

      mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
    >

      <Marker
        longitude={77.3910}
        latitude={28.5355}
      />

    </Map>
  );
}

export default MapComponent;