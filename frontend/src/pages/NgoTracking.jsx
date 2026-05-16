import { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MapPanel from "../components/MapPanel";
import { joinRoom, leaveRoom } from "../socket/socket";
import { getNgoClaimedFoods } from "../store/claimSlice";
import { clearRoomLocations, setActiveRoom } from "../store/socketSlice";

const NgoTracking = () => {
    const { foodId } = useParams();
    const dispatch = useDispatch();
    const { claimedFoods, loading, error } = useSelector((state) => state.claimReducer);
    const { liveLocations } = useSelector((state) => state.socketReducer);
    const { items: notifications } = useSelector(
        (state) => state.notificationReducer || { items: [] }
    );

    useEffect(() => {
        dispatch(getNgoClaimedFoods());
    }, [dispatch]);

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

    const trackedClaim = useMemo(() => {
        return (claimedFoods || []).find((item) => {
            const id = item.foodId?._id || item.foodId;
            return id && String(id) === String(foodId);
        });
    }, [claimedFoods, foodId]);

    const trackedFood = trackedClaim?.foodId;

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

    const trackingMarkers = useMemo(() => {
        const markers = [];

        if (trackedFood?.location?.coordinates?.length === 2) {
            markers.push({
                id: trackedFood._id,
                longitude: trackedFood.location.coordinates[0],
                latitude: trackedFood.location.coordinates[1],
                label: trackedFood.name?.[0] || "F",
                title: trackedFood.name,
                imageUrl: trackedFood.foodImage?.thumbnail || trackedFood.foodImage?.url,
                color: "var(--accent)",
            });
        }

        return [...markers, ...volunteerMarkers];
    }, [trackedFood, volunteerMarkers]);

    const trackingViewState = useMemo(() => {
        if (trackedFood?.location?.coordinates?.length === 2) {
            return {
                latitude: trackedFood.location.coordinates[1],
                longitude: trackedFood.location.coordinates[0],
                zoom: 13,
            };
        }

        if (trackingMarkers.length) {
            return {
                latitude: trackingMarkers[0].latitude,
                longitude: trackingMarkers[0].longitude,
                zoom: 13,
            };
        }

        return { latitude: 28.6139, longitude: 77.209, zoom: 4 };
    }, [trackedFood, trackingMarkers]);

    const roomNotices = notifications.filter((notice) => String(notice.foodId) === String(foodId));

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Volunteer live tracking</h2>
                    <p className="text-sm text-[var(--muted)]">
                        Follow the volunteer route for this accepted claim in a dedicated tracking room.
                    </p>
                </div>
                <Link
                    to="/ngo/claims"
                    className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                >
                    Back to NGO claims
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                <MapPanel
                    title={trackedFood?.name || "Volunteer tracking room"}
                    description="The orange marker is the pickup point. Blue markers update live as the volunteer shares location."
                    markers={trackingMarkers}
                    initialViewState={trackingViewState}
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
                                {trackedFood?.foodImage?.url && (
                                    <img
                                        src={trackedFood.foodImage.url}
                                        alt={trackedFood.name}
                                        className="h-40 w-full rounded-2xl object-cover"
                                    />
                                )}
                                <p className="text-lg font-semibold text-[var(--ink)]">
                                    {trackedFood?.name || "Tracked food"}
                                </p>
                                <p className="text-[var(--muted)]">
                                    {trackedFood?.restaurantId?.restaurantName || "Restaurant pending"}
                                </p>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Claim status</span>
                                    <span className="font-semibold uppercase text-[var(--ink)]">
                                        {trackedClaim.status}
                                    </span>
                                </div>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Volunteer markers</span>
                                    <span className="font-semibold text-[var(--ink)]">
                                        {volunteerMarkers.length}
                                    </span>
                                </div>
                                <div className="flex justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Claim ID</span>
                                    <span className="font-semibold text-[var(--ink)]">
                                        {trackedClaim._id}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-[var(--muted)]">
                                This tracking page is waiting for a matching accepted claim.
                            </p>
                        )}
                        {(loading || error) && (
                            <p className="mt-4 text-sm text-red-500">{error || "Loading claim data..."}</p>
                        )}
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Room updates</h3>
                        <div className="mt-4 space-y-3">
                            {roomNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm"
                                >
                                    <p className="font-semibold text-[var(--ink)]">
                                        {notice.message || "Room update"}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                        {notice.type || "notification"}
                                    </p>
                                </div>
                            ))}
                            {!roomNotices.length && (
                                <p className="text-sm text-[var(--muted)]">
                                    Waiting for volunteer location updates in this room.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NgoTracking;
