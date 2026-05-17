import Map, {
    FullscreenControl,
    Marker,
    NavigationControl,
    ScaleControl,
} from "react-map-gl/mapbox";

const MapPanel = ({
    title,
    description,
    height = 460,
    initialViewState,
    markers = [],
    headerActions,
    legendItems = [],
    mapStyle = "mapbox://styles/mapbox/navigation-day-v1",
    children,
}) => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const viewKey = [
        initialViewState?.latitude,
        initialViewState?.longitude,
        initialViewState?.zoom,
    ].join(":");

    if (!token) {
        return (
            <div className="glass-panel grid place-items-center rounded-3xl border border-white/70 p-10 text-center">
                <div>
                    <h3 className="font-display text-xl">Mapbox token missing</h3>
                    <p className="mt-2 text-sm text-(--muted)">
                        Add VITE_MAPBOX_TOKEN to your frontend .env to render maps.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-panel overflow-hidden rounded-3xl border border-white/70">
            {(title || description) && (
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,247,241,0.92))] px-6 py-4">
                    <div>
                        {title && <h3 className="font-display text-lg">{title}</h3>}
                        {description && (
                            <p className="text-sm text-(--muted)">{description}</p>
                        )}
                    </div>
                    {headerActions ? <div className="flex flex-wrap gap-2">{headerActions}</div> : null}
                </div>
            )}
            <div className="relative" style={{ height }}>
                <Map
                    key={viewKey}
                    mapboxAccessToken={token}
                    initialViewState={initialViewState}
                    mapStyle={mapStyle}
                >
                    <NavigationControl position="top-right" />
                    <FullscreenControl position="top-right" />
                    <ScaleControl position="bottom-right" />
                    {markers.map((marker) => (
                        <Marker
                            key={marker.id}
                            longitude={marker.longitude}
                            latitude={marker.latitude}
                            anchor="bottom"
                            onClick={marker.onClick}
                        >
                            <div className="relative">
                                {marker.isActive && marker.title ? (
                                    <div className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--ink) px-3 py-1 text-[11px] font-semibold text-white shadow-xl">
                                        {marker.title}
                                    </div>
                                ) : null}
                                <div
                                    className={`grid h-14 w-14 cursor-pointer place-items-center overflow-hidden rounded-full border-2 text-xs font-semibold text-white shadow-lg transition duration-200 ${
                                        marker.isActive
                                            ? "scale-110 border-white shadow-2xl ring-4 ring-white/65"
                                            : "border-white/90 hover:scale-105"
                                    }`}
                                    style={{ background: marker.color || "var(--accent)" }}
                                    title={marker.title}
                                >
                                    {marker.imageUrl ? (
                                        <img
                                            src={marker.imageUrl}
                                            alt={marker.title || "Food marker"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        marker.label || "F"
                                    )}
                                </div>
                            </div>
                        </Marker>
                    ))}
                    {children}
                </Map>
                {legendItems.length ? (
                    <div className="pointer-events-none absolute bottom-4 left-4 rounded-2xl border border-white/80 bg-white/88 px-4 py-3 shadow-xl backdrop-blur">
                        <div className="flex flex-wrap gap-3">
                            {legendItems.map((item) => (
                                <div key={item.label} className="flex items-center gap-2 text-xs font-semibold text-(--ink)">
                                    <span
                                        className="h-3 w-3 rounded-full border border-white shadow-sm"
                                        style={{ background: item.color }}
                                    />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MapPanel;
