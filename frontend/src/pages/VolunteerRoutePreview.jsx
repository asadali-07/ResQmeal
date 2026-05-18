import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Map, {
  FullscreenControl,
  Layer,
  Marker,
  NavigationControl,
  ScaleControl,
  Source,
} from "react-map-gl/mapbox";
import { getFoodById } from "../store/foodSlice";
import { getUserVolunteer } from "../store/volunteerSlice";

const routeLayer = {
  id: "volunteer-route-line",
  type: "line",
  paint: {
    "line-color": "#f26b1d",
    "line-width": 5,
    "line-opacity": 0.9,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

const fallbackRouteLayer = {
  ...routeLayer,
  id: "volunteer-route-fallback-line",
  paint: {
    ...routeLayer.paint,
    "line-color": "#1d6ff2",
    "line-dasharray": [2, 2],
  },
};

const VolunteerRoutePreview = () => {
  const { foodId } = useParams();
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  const {
    availableFoods,
    food,
    loading: foodLoading,
    error: foodError,
  } = useSelector((state) => state.foodReducer);
  const {
    volunteer,
    loading: volunteerLoading,
    error: volunteerError,
  } = useSelector((state) => state.volunteerReducer);
  const [liveCoords, setLiveCoords] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [routeError, setRouteError] = useState("");
  const [routeLoading, setRouteLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNote, setLocationNote] = useState(() => {
    if (!navigator.geolocation) {
      return "Live location is unavailable in this browser. Using your NGO profile coordinates.";
    }

    return "Updating route from your live location.";
  });

  useEffect(() => {
    dispatch(getUserVolunteer());
    if (foodId) {
      dispatch(getFoodById(foodId));
    }
  }, [dispatch, foodId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveCoords([position.coords.longitude, position.coords.latitude]);

        setLocationNote(
          "Using your live device location for this route preview.",
        );
      },
      () => {
        setLocationNote(
          "Live location permission was denied. Using your NGO profile coordinates.",
        );
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 12000,
      },
    );
  }, []);

  const requestLiveLocation = () => {
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveCoords([position.coords.longitude, position.coords.latitude]);

        setLocationNote(
          "Using your live device location for this route preview.",
        );

        setIsLocating(false);
      },
      () => {
        setLocationNote("Live location permission was denied.");

        setIsLocating(false);
      },
    );
  };

  const routeFood = useMemo(() => {
    const listedFood = (availableFoods || []).find(
      (item) => String(item._id) === String(foodId),
    );
    if (listedFood) {
      return listedFood;
    }

    if (food?._id && String(food._id) === String(foodId)) {
      return food;
    }

    return null;
  }, [availableFoods, food, foodId]);

  const profileCoords =
    volunteer?.currentLocation?.coordinates?.length === 2
      ? volunteer.currentLocation.coordinates
      : null;
  const originCoords = liveCoords || profileCoords;
  const pickupCoords =
    routeFood?.location?.coordinates?.length === 2
      ? routeFood.location.coordinates
      : null;

  const fallbackRoute = useMemo(() => {
    if (!originCoords || !pickupCoords) {
      return null;
    }

    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [originCoords, pickupCoords],
      },
    };
  }, [originCoords, pickupCoords]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!originCoords || !pickupCoords || !token) {
        return;
      }

      setRouteLoading(true);
      setRouteError("");

      try {
        const url =
          `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${originCoords[0]},${originCoords[1]};${pickupCoords[0]},${pickupCoords[1]}` +
          `?geometries=geojson&overview=full&steps=false&access_token=${token}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Route service unavailable");
        }

        const data = await response.json();
        const firstRoute = data.routes?.[0];

        if (!firstRoute?.geometry?.coordinates?.length) {
          throw new Error("No route returned");
        }

        setRouteData(firstRoute);
      } catch {
        setRouteData(null);
        setRouteError(
          "Could not load a turn-by-turn route, so a direct line preview is shown instead.",
        );
      } finally {
        setRouteLoading(false);
      }
    };

    fetchRoute();
  }, [originCoords, pickupCoords, token]);

  const routeFeature = useMemo(() => {
    if (!routeData?.geometry?.coordinates?.length) {
      return null;
    }

    return {
      type: "Feature",
      geometry: routeData.geometry,
    };
  }, [routeData]);

  useEffect(() => {
    const coordinates =
      routeFeature?.geometry?.coordinates ||
      fallbackRoute?.geometry?.coordinates ||
      [];

    if (coordinates.length < 2 || !mapRef.current) {
      return;
    }

    const longitudes = coordinates.map((point) => point[0]);
    const latitudes = coordinates.map((point) => point[1]);
    const bounds = [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ];

    mapRef.current.fitBounds(bounds, {
      padding: 80,
      duration: 800,
    });
  }, [fallbackRoute, routeFeature]);

  const estimateDistanceKm = (start, end) => {
    if (!start || !end) {
      return null;
    }

    const toRadians = (value) => (value * Math.PI) / 180;
    const [lng1, lat1] = start;
    const [lng2, lat2] = end;
    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const formatDistance = (distanceMeters) => {
    if (!distanceMeters && distanceMeters !== 0) {
      return "-";
    }
    const distanceKm = distanceMeters / 1000;
    return `${distanceKm.toFixed(distanceKm >= 10 ? 1 : 2)} km`;
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) {
      return "-";
    }
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hr ${remainingMinutes} min`;
  };

  const fallbackDistanceKm = estimateDistanceKm(originCoords, pickupCoords);
  const routeDistanceLabel = routeData?.distance
    ? formatDistance(routeData.distance)
    : fallbackDistanceKm
      ? `${fallbackDistanceKm.toFixed(fallbackDistanceKm >= 10 ? 1 : 2)} km`
      : "-";
  const routeDurationLabel = routeData?.duration
    ? formatDuration(routeData.duration)
    : "Direct preview";

  const markers = useMemo(() => {
    const nextMarkers = [];

    if (originCoords) {
      nextMarkers.push({
        id: "volunteer-origin",
        longitude: originCoords[0],
        latitude: originCoords[1],
        label: "V",
        title: liveCoords ? "Your live location" : "Your volunteer location",
        color: "var(--accent-2)",
      });
    }

    if (pickupCoords) {
      nextMarkers.push({
        id: "pickup",
        longitude: pickupCoords[0],
        latitude: pickupCoords[1],
        label: routeFood?.name?.[0] || "F",
        title: routeFood?.name || "Pickup point",
        imageUrl: routeFood?.foodImage?.thumbnail || routeFood?.foodImage?.url,
        color: "var(--accent)",
      });
    }

    return nextMarkers;
  }, [liveCoords, originCoords, pickupCoords, routeFood]);

  const mapView = useMemo(() => {
    if (routeFeature?.geometry?.coordinates?.length) {
      const coordinates = routeFeature.geometry.coordinates;
      const middlePoint = coordinates[Math.floor(coordinates.length / 2)];
      return {
        longitude: middlePoint[0],
        latitude: middlePoint[1],
        zoom: 11,
      };
    }

    if (fallbackRoute?.geometry?.coordinates?.length) {
      const [start, end] = fallbackRoute.geometry.coordinates;
      return {
        longitude: (start[0] + end[0]) / 2,
        latitude: (start[1] + end[1]) / 2,
        zoom: 11,
      };
    }

    if (pickupCoords) {
      return {
        longitude: pickupCoords[0],
        latitude: pickupCoords[1],
        zoom: 12,
      };
    }

    return { latitude: 28.6139, longitude: 77.209, zoom: 4 };
  }, [fallbackRoute, pickupCoords, routeFeature]);

  const viewKey = [
    foodId,
    originCoords?.[0],
    originCoords?.[1],
    pickupCoords?.[0],
    pickupCoords?.[1],
  ].join(":");

  const addressLabel =
    routeFood?.restaurantId?.address?.formattedAddress ||
    routeFood?.restaurantId?.address ||
    "";

  if (!token) {
    return (
      <div className="glass-panel grid place-items-center rounded-3xl border border-white/70 p-10 text-center">
        <div>
          <h3 className="font-display text-xl">Mapbox token missing</h3>
          <p className="mt-2 text-sm text-(--muted)">
            Add VITE_MAPBOX_TOKEN to your frontend .env to render route
            previews.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">Volunteer pickup route</h2>
          <p className="text-sm text-(--muted)">
            Route from your volunteer location to the restaurant pickup point.
          </p>
        </div>
        <Link
          to="/volunteer"
          className="rounded-full border border-(--accent-2) px-5 py-2 text-sm font-semibold text-(--accent-2)"
        >
          Back to volunteer map
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel overflow-hidden rounded-3xl border border-white/70">
          <div className="border-b border-white/70 px-6 py-4">
            <h3 className="font-display text-lg">
              {routeFood?.name || "Pickup route"}
            </h3>
            <p className="text-sm text-(--muted)">
              Orange shows the driving route. Blue is the direct fallback if
              routing is unavailable.
            </p>
          </div>
          <div style={{ height: 560 }}>
            <Map
              key={viewKey}
              ref={mapRef}
              mapboxAccessToken={token}
              initialViewState={mapView}
              mapStyle="mapbox://styles/mapbox/navigation-day-v1"
            >
              <NavigationControl position="top-right" />
              <FullscreenControl position="top-right" />
              <ScaleControl position="bottom-right" />
              {routeFeature && (
                <Source id="volunteer-route" type="geojson" data={routeFeature}>
                  <Layer {...routeLayer} />
                </Source>
              )}
              {!routeFeature && fallbackRoute && (
                <Source
                  id="volunteer-route-fallback"
                  type="geojson"
                  data={fallbackRoute}
                >
                  <Layer {...fallbackRouteLayer} />
                </Source>
              )}
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  longitude={marker.longitude}
                  latitude={marker.latitude}
                  anchor="bottom"
                >
                  <div
                    className="grid h-14 w-14 place-items-center overflow-hidden rounded-full border-2 border-white text-xs font-semibold text-white shadow-lg"
                    style={{ background: marker.color }}
                    title={marker.title}
                  >
                    {marker.imageUrl ? (
                      <img
                        src={marker.imageUrl}
                        alt={marker.title || "Marker"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      marker.label
                    )}
                  </div>
                </Marker>
              ))}
            </Map>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl">Route summary</h3>
                <p className="mt-1 text-sm text-(--muted)">{locationNote}</p>
              </div>
              <button
                type="button"
                disabled={isLocating}
                onClick={requestLiveLocation}
                className="rounded-full border border-(--accent-2) px-4 py-2 text-xs font-semibold text-(--accent-2)"
              >
                {isLocating ? "Refreshing..." : "Refresh my location"}
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                  Distance
                </p>
                <p className="mt-2 text-2xl font-display text-(--ink)">
                  {routeDistanceLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                  ETA
                </p>
                <p className="mt-2 text-2xl font-display text-(--ink)">
                  {routeDurationLabel}
                </p>
              </div>
            </div>

            {(routeLoading || routeError) && (
              <p className="mt-4 text-sm text-(--muted)">
                {routeLoading ? "Calculating route..." : routeError}
              </p>
            )}
          </div>

          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">Pickup details</h3>
            {routeFood ? (
              <div className="mt-4 space-y-4">
                {routeFood.foodImage?.url && (
                  <img
                    src={routeFood.foodImage.url}
                    alt={routeFood.name}
                    className="h-44 w-full rounded-2xl object-cover"
                  />
                )}
                <div className="rounded-[28px] border border-white/80 bg-white/85 p-5">
                  <p className="text-lg font-semibold [var(--ink)">
                    {routeFood.name}
                  </p>
                  <p className="mt-1 text-sm text-(--muted)">
                    {routeFood.description}
                  </p>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm">
                    <span className="text-(--muted)">Restaurant</span>
                    <span className="text-right font-semibold text-(--ink)">
                      {routeFood.restaurantId?.restaurantName || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm">
                    <span className="text-(--muted)">Pickup time</span>
                    <span className="text-right font-semibold text-(--ink)">
                      {routeFood.pickupTime
                        ? new Date(routeFood.pickupTime).toLocaleString()
                        : "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm">
                    <span className="text-(--muted)">Quantity</span>
                    <span className="font-semibold text-(--ink)">
                      {routeFood.quantity || "-"}
                    </span>
                  </div>
                </div>
                {addressLabel && (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-(--muted)">
                    {addressLabel}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-(--muted)">
                Loading pickup details for this route.
              </p>
            )}
            {(foodError || volunteerError) && (
              <p className="mt-4 text-sm text-red-500">
                {foodError || volunteerError}
              </p>
            )}
            {(foodLoading || volunteerLoading) && (
              <p className="mt-4 text-sm text-(--muted)">
                Loading map context...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerRoutePreview;
