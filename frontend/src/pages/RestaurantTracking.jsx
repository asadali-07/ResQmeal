import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MapPanel from "../components/MapPanel";
import TokenQrCard from "../components/TokenQrCard";
import { joinRoom, leaveRoom } from "../socket/socket";
import { getRestaurantClaims } from "../store/claimSlice";
import { clearRoomLocations, setActiveRoom } from "../store/socketSlice";

const RestaurantTracking = () => {
    const { foodId } = useParams();
    const dispatch = useDispatch();
    const { restaurantClaims, loading, error } = useSelector((state) => state.claimReducer);
    const { liveLocations } = useSelector((state) => state.socketReducer);
    const { items: notifications } = useSelector(
        (state) => state.notificationReducer || { items: [] }
    );

    useEffect(() => {
        dispatch(getRestaurantClaims());
    }, [dispatch]);

    useEffect(() => {
        if (notifications.length) {
            dispatch(getRestaurantClaims());
        }
    }, [dispatch, notifications.length]);

    useEffect(() => {
        if (!foodId) {
            return undefined;
        }

        joinRoom(foodId);
        dispatch(setActiveRoom(foodId));

        return () => {
            leaveRoom(foodId);
            dispatch(clearRoomLocations(foodId));
            dispatch(setActiveRoom(null));
        };
    }, [dispatch, foodId]);

    const trackedClaim = useMemo(
        () =>
            (restaurantClaims || []).find((item) => {
                const trackedFoodId = item.foodId?._id || item.foodId;
                return trackedFoodId && String(trackedFoodId) === String(foodId);
            }),
        [restaurantClaims, foodId]
    );
    const food = trackedClaim?.foodId;

    const foodMarker = useMemo(() => {
        if (!food?.location?.coordinates?.length) {
            return [];
        }

        return [
            {
                id: food._id,
                longitude: food.location.coordinates[0],
                latitude: food.location.coordinates[1],
                title: food.name,
                label: food.name?.[0] || "F",
                imageUrl: food.foodImage?.thumbnail || food.foodImage?.url,
                color: "var(--accent)",
            },
        ];
    }, [food]);

    const volunteerMarkers = useMemo(() => {
        if (!foodId || !liveLocations?.[foodId]) {
            return [];
        }

        return Object.entries(liveLocations[foodId]).map(([userId, location]) => ({
            id: `volunteer-${userId}`,
            longitude: location.lng,
            latitude: location.lat,
            label: "V",
            title: `Volunteer ${userId}`,
            color: "var(--accent-2)",
        }));
    }, [foodId, liveLocations]);

    const markers = [...foodMarker, ...volunteerMarkers];
    const initialViewState = markers.length
        ? {
              longitude: markers[0].longitude,
              latitude: markers[0].latitude,
              zoom: 13,
          }
        : { latitude: 28.6139, longitude: 77.209, zoom: 4 };

    const roomNotices = notifications.filter((notice) => String(notice.foodId) === String(foodId));

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Food live tracking</h2>
                    <p className="text-sm text-(--muted)">
                        Follow the volunteer route for this accepted restaurant claim.
                    </p>
                </div>
                <Link
                    to="/restaurant/claims"
                    className="rounded-full border border-(--accent-2) px-5 py-2 text-sm font-semibold text-(--accent-2)"
                >
                    Back to claims
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                <MapPanel
                    title={food?.name || "Tracking room"}
                    description="The orange marker is your pickup point. Blue markers update live as the volunteer shares location."
                    markers={markers}
                    initialViewState={initialViewState}
                    height={560}
                    legendItems={[
                        { label: "Pickup point", color: "var(--accent)" },
                        { label: "Volunteer live location", color: "var(--accent-2)" },
                    ]}
                />

                <div className="space-y-4">
                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Claim summary</h3>
                        {trackedClaim ? (
                            <div className="mt-4 space-y-3 text-sm">
                                {food?.foodImage?.url && (
                                    <img
                                        src={food.foodImage.url}
                                        alt={food.name}
                                        className="h-40 w-full rounded-2xl object-cover"
                                    />
                                )}
                                <p className="text-lg font-semibold text-(--ink)">
                                    {food.name}
                                </p>
                                <p className="text-(--muted)">{food.description}</p>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Status</span>
                                    <span className="font-semibold uppercase text-(--ink)">
                                        {food.status}
                                    </span>
                                </div>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Claim status</span>
                                    <span className="font-semibold uppercase text-(--ink)">
                                        {trackedClaim.status}
                                    </span>
                                </div>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Volunteer markers</span>
                                    <span className="font-semibold text-(--ink)">
                                        {volunteerMarkers.length}
                                    </span>
                                </div>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Claim ID</span>
                                    <span className="font-semibold text-(--ink)">
                                        {trackedClaim._id}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-(--muted)">
                                This tracking page is waiting for a matching accepted claim.
                            </p>
                        )}
                        {(loading || error) && (
                            <p className="mt-4 text-sm text-red-500">{error || "Loading claim data..."}</p>
                        )}
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Room updates</h3>
                        <div className="mt-4 space-y-3 overflow-y-auto max-h-90">
                            {roomNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="rounded-2xl border flex flex-col gap-2 border-orange-100 bg-white p-4 text-sm shadow-md ring-1 ring-orange-50"
                                >
                                    <p className="font-semibold text-(--ink)">
                                        {notice.message || "Room update"}
                                    </p>
                                    <p className="mt-1 text-xs text-(--muted)">
                                        {notice.type || "notification"}
                                    </p>
                                    {notice.pickupToken && (
                                        <div className="mt-3">
                                            <TokenQrCard
                                                title="Pickup token"
                                                token={notice.pickupToken}
                                                description="Present this QR to the volunteer for pickup verification."
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!roomNotices.length && (
                                <p className="text-sm text-(--muted)">
                                    Claim and volunteer updates for this food will collect here.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantTracking;
