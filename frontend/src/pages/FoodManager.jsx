import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MapPanel from "../components/MapPanel";
import TokenQrCard from "../components/TokenQrCard";
import { joinRoom, leaveRoom } from "../socket/socket";
import { getRestaurantClaims } from "../store/claimSlice";
import { createFood, updateFood, deleteFood, getFoodListings } from "../store/foodSlice";
import { clearRoomLocations, setActiveRoom } from "../store/socketSlice";

const FoodManager = () => {
    const dispatch = useDispatch();
    const { food, foods, loading, error } = useSelector((state) => state.foodReducer);
    const { restaurantClaims } = useSelector((state) => state.claimReducer);
    const { items: notifications } = useSelector(
        (state) => state.notificationReducer || { items: [] }
    );
    const { liveLocations } = useSelector((state) => state.socketReducer);
    const { register, handleSubmit, reset } = useForm();
    const [selectedFood, setSelectedFood] = useState(null);
    const [editingFood, setEditingFood] = useState(null);
    const [editValues, setEditValues] = useState({
        name: "",
        description: "",
        quantity: "",
        pickupTime: "",
        expiryTime: "",
        foodImage: null,
    });
    const [trackingFoodId, setTrackingFoodId] = useState("");

    useEffect(() => {
        dispatch(getFoodListings());
        dispatch(getRestaurantClaims());
    }, [dispatch]);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            dispatch(getFoodListings());
            dispatch(getRestaurantClaims());
        }, 8000);

        return () => window.clearInterval(intervalId);
    }, [dispatch]);

    useEffect(() => {
        if (notifications.length) {
            dispatch(getFoodListings());
            dispatch(getRestaurantClaims());
        }
    }, [dispatch, notifications.length]);

    const onSubmit = async (values) => {
        const payload = {
            name: values.name,
            description: values.description,
            quantity: Number(values.quantity),
            expiryTime: values.expiryTime,
            pickupTime: values.pickupTime,
            foodImage: values.foodImage?.[0],
        };

        if (!payload.foodImage) {
            delete payload.foodImage;
        }

        const result = await dispatch(createFood(payload));

        if (result?.meta?.requestStatus === "fulfilled") {
            reset();
            dispatch(getFoodListings());
        }
    };

    const handleOpenEdit = (foodItem) => {
        if (!foodItem || foodItem.status !== "available") {
            return;
        }
        setEditingFood(foodItem);
        setSelectedFood(foodItem);
        setEditValues({
            name: foodItem.name || "",
            description: foodItem.description || "",
            quantity: foodItem.quantity || "",
            pickupTime: foodItem.pickupTime?.slice(0, 16) || "",
            expiryTime: foodItem.expiryTime?.slice(0, 16) || "",
            foodImage: null,
        });
    };

    const handleCloseEdit = () => {
        setEditingFood(null);
        setEditValues({
            name: "",
            description: "",
            quantity: "",
            pickupTime: "",
            expiryTime: "",
            foodImage: null,
        });
    };

    const handleEditChange = (event) => {
        const { name, value, files } = event.target;
        setEditValues((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleUpdateFood = async (event) => {
        event.preventDefault();
        if (!editingFood?._id) {
            return;
        }
        const payload = {
            name: editValues.name,
            description: editValues.description,
            quantity: Number(editValues.quantity),
            pickupTime: editValues.pickupTime,
            expiryTime: editValues.expiryTime,
        };
        if (editValues.foodImage) {
            payload.foodImage = editValues.foodImage;
        }
        const result = await dispatch(updateFood({ foodId: editingFood._id, ...payload }));
        if (result?.meta?.requestStatus === "fulfilled") {
            handleCloseEdit();
            dispatch(getFoodListings());
        }
    };

    const handleDelete = async (foodId) => {
        if (!foodId) {
            return;
        }
        const result = await dispatch(deleteFood(foodId));
        if (result?.meta?.requestStatus === "fulfilled") {
            if (selectedFood?._id === foodId) {
                setSelectedFood(null);
            }
            dispatch(getFoodListings());
        }
    };

    const foodMarkers = useMemo(() => {
        return (foods || [])
            .filter((listing) => listing.location?.coordinates?.length === 2)
            .map((listing) => ({
                id: listing._id,
                longitude: listing.location.coordinates[0],
                latitude: listing.location.coordinates[1],
                title: listing.name,
                label: listing.name?.[0] || "F",
                imageUrl: listing.foodImage?.thumbnail || listing.foodImage?.url,
                color: "var(--accent)",
                onClick: () => setSelectedFood(listing),
            }));
    }, [foods]);

    const liveMarkers = useMemo(() => {
        if (!trackingFoodId || !liveLocations?.[trackingFoodId]) {
            return [];
        }
        return Object.entries(liveLocations[trackingFoodId]).map(([userId, location]) => ({
            id: `live-${userId}`,
            longitude: location.lng,
            latitude: location.lat,
            label: userId.slice(0, 2).toUpperCase(),
            title: "Volunteer live location",
            color: "var(--accent-2)",
        }));
    }, [liveLocations, trackingFoodId]);

    const mapMarkers = [...foodMarkers, ...liveMarkers];
    const initialViewState = foodMarkers.length
        ? {
              longitude: foodMarkers[0].longitude,
              latitude: foodMarkers[0].latitude,
              zoom: 12,
          }
        : { latitude: 28.6139, longitude: 77.209, zoom: 4 };

    const claimNotices = notifications.filter((notice) =>
        ["CLAIM_CREATED", "CLAIM_ACCEPTED", "PICKUP_VERIFIED"].includes(notice.type)
    );

    const activeClaimByFoodId = useMemo(() => {
        return new Map(
            (restaurantClaims || []).map((claimItem) => [
                String(claimItem.foodId?._id || claimItem.foodId),
                claimItem,
            ])
        );
    }, [restaurantClaims]);

    const getStatusClass = (status) => {
        if (status === "pending") {
            return "bg-[var(--accent-3)]/20 text-yellow-700";
        }
        if (status === "available") {
            return "bg-[var(--accent-2)]/15 text-[var(--accent-2)]";
        }
        return "bg-white text-[var(--muted)]";
    };

    const canTrackFood = (foodId) => {
        const claimItem = activeClaimByFoodId.get(String(foodId));
        return ["accepted", "picked_up", "delivered"].includes(claimItem?.status);
    };

    const handleTrackFood = (foodId) => {
        if (!foodId) {
            return;
        }
        if (trackingFoodId) {
            leaveRoom(trackingFoodId);
            dispatch(clearRoomLocations(trackingFoodId));
        }
        setTrackingFoodId(foodId);
        joinRoom(foodId);
        dispatch(setActiveRoom(foodId));
    };

    const handleStopTracking = () => {
        if (!trackingFoodId) {
            return;
        }
        leaveRoom(trackingFoodId);
        dispatch(clearRoomLocations(trackingFoodId));
        dispatch(setActiveRoom(null));
        setTrackingFoodId("");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Food listing studio</h2>
                    <p className="text-sm text-[var(--muted)]">
                        Share leftover meals so NGOs can claim them on the map.
                    </p>
                </div>
                <Link
                    to="/restaurant/claims"
                    className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                >
                    Open restaurant claims
                </Link>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="glass-panel rounded-3xl border border-white/70 p-6">
                    <h3 className="font-display text-xl">Create new listing</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Food name</label>
                            <input
                                type="text"
                                {...register("name", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Description</label>
                            <textarea
                                rows="3"
                                {...register("description", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold">Quantity</label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register("quantity", { required: true })}
                                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Pickup time</label>
                                <input
                                    type="datetime-local"
                                    {...register("pickupTime", { required: true })}
                                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold">Expiry time</label>
                                <input
                                    type="datetime-local"
                                    {...register("expiryTime", { required: true })}
                                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Food image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register("foodImage", { required: true })}
                                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2"
                                />
                            </div>
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="flex-1 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Create listing"}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="glass-panel rounded-3xl border border-white/70 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-display text-xl">Active listings</h3>
                        <button
                            onClick={() => dispatch(getFoodListings())}
                            className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
                        >
                            Refresh listings
                        </button>
                    </div>
                    {food ? (
                        <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                            <p className="text-base font-semibold text-[var(--ink)]">{food.name}</p>
                            <p>{food.description}</p>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Quantity</span>
                                <span className="font-semibold text-[var(--ink)]">{food.quantity}</span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Status</span>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(food.status)}`}>
                                    {food.status}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-3 pt-2">
                                {food.status === "available" && (
                                    <button
                                        onClick={() => handleDelete(food._id)}
                                        className="rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500"
                                    >
                                        Delete listing
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm text-[var(--muted)]">
                            No listing created yet. Publish your first surplus item.
                        </p>
                    )}
                    <div className="mt-6 space-y-3">
                        {foods?.length ? (
                            foods.map((listing) => (
                                <div
                                    key={listing._id}
                                    className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-[var(--ink)]">
                                            {listing.name}
                                        </p>
                                        <span className="text-xs text-[var(--muted)]">
                                            <span className={`rounded-full px-3 py-1 font-semibold uppercase ${getStatusClass(listing.status)}`}>
                                                {listing.status}
                                            </span>
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-[var(--muted)]">
                                        {listing.description}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {listing.status === "available" && (
                                            <>
                                                <button
                                                    onClick={() => handleOpenEdit(listing)}
                                                    className="rounded-full border border-[var(--accent-2)] px-3 py-1 text-xs font-semibold text-[var(--accent-2)]"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing._id)}
                                                    className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-500"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-[var(--muted)]">
                                No active listings found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <MapPanel
                    title="Leftover food on map"
                    description="Every active listing is pinned from your restaurant pickup location."
                    markers={mapMarkers}
                    initialViewState={initialViewState}
                    height={460}
                />
                <div className="space-y-4">
                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Selected listing</h3>
                        {selectedFood ? (
                            <div className="mt-4 space-y-3 text-sm">
                                {selectedFood.foodImage?.url && (
                                    <img
                                        src={selectedFood.foodImage.url}
                                        alt={selectedFood.name}
                                        className="h-40 w-full rounded-2xl object-cover"
                                    />
                                )}
                                <p className="text-lg font-semibold text-[var(--ink)]">
                                    {selectedFood.name}
                                </p>
                                <p className="text-[var(--muted)]">{selectedFood.description}</p>
                                <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Quantity</span>
                                    <span className="font-semibold text-[var(--ink)]">
                                        {selectedFood.quantity}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                    <span>Status</span>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusClass(selectedFood.status)}`}>
                                        {selectedFood.status}
                                    </span>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {selectedFood.status === "available" && (
                                        <button
                                            onClick={() => handleOpenEdit(selectedFood)}
                                            className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-[var(--accent-2)]"
                                        >
                                            Edit listing
                                        </button>
                                    )}
                                    {canTrackFood(selectedFood._id) ? (
                                        <>
                                            <button
                                                onClick={() => handleTrackFood(selectedFood._id)}
                                                className="rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white"
                                            >
                                                Preview route
                                            </button>
                                            <Link
                                                to={`/restaurant/track/${selectedFood._id}`}
                                                className="rounded-full bg-[var(--accent)] px-4 py-2 text-center text-sm font-semibold text-white"
                                            >
                                                Open tracking page
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-white/80 px-4 py-3 text-xs text-[var(--muted)] sm:col-span-2">
                                            Tracking becomes available once a volunteer accepts this claim.
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-[var(--muted)]">
                                Select a marker or listing to inspect it.
                            </p>
                        )}
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-display text-xl">Pickup handoff</h3>
                            {trackingFoodId && (
                                <button
                                    onClick={handleStopTracking}
                                    className="rounded-full border border-red-400 px-3 py-1 text-xs font-semibold text-red-500"
                                >
                                    Stop tracking
                                </button>
                            )}
                        </div>
                        <div className="mt-4 space-y-3">
                            {claimNotices.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm"
                                >
                                    <p className="font-semibold text-[var(--ink)]">
                                        {notice.message || "Claim update"}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                        Food: {notice.foodName || notice.foodId || "-"}
                                    </p>
                                    {notice.pickupToken && (
                                        <div className="mt-3">
                                            <TokenQrCard
                                                title="Pickup token"
                                                token={notice.pickupToken}
                                                description="Show this QR to the volunteer at handoff, or share the token manually if scanning is not convenient."
                                            />
                                        </div>
                                    )}
                                    {notice.foodId && ["CLAIM_ACCEPTED", "PICKUP_VERIFIED"].includes(notice.type) && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleTrackFood(notice.foodId)}
                                                className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
                                            >
                                                Preview route
                                            </button>
                                            <Link
                                                to={`/restaurant/track/${notice.foodId}`}
                                                className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
                                            >
                                                Open tracking page
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {!claimNotices.length && (
                                <p className="text-sm text-[var(--muted)]">
                                    Claim and pickup updates will appear here in real time.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {editingFood && (
                <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 px-4 py-6 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-white/80 bg-white p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-2xl">Edit food listing</h3>
                                <p className="text-sm text-[var(--muted)]">
                                    Update available food details before it is claimed.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseEdit}
                                className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-[var(--accent-2)]"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleUpdateFood} className="mt-6 space-y-4">
                            <div>
                                <label className="text-sm font-semibold">Food name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editValues.name}
                                    onChange={handleEditChange}
                                    required
                                    className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Description</label>
                                <textarea
                                    rows="3"
                                    name="description"
                                    value={editValues.description}
                                    onChange={handleEditChange}
                                    required
                                    className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3"
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold">Quantity</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={editValues.quantity}
                                        onChange={handleEditChange}
                                        required
                                        className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Pickup time</label>
                                    <input
                                        type="datetime-local"
                                        name="pickupTime"
                                        value={editValues.pickupTime}
                                        onChange={handleEditChange}
                                        required
                                        className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-sm font-semibold">Expiry time</label>
                                    <input
                                        type="datetime-local"
                                        name="expiryTime"
                                        value={editValues.expiryTime}
                                        onChange={handleEditChange}
                                        required
                                        className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold">Replace food image</label>
                                    <input
                                        type="file"
                                        name="foodImage"
                                        accept="image/*"
                                        onChange={handleEditChange}
                                        className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-2"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                                >
                                    {loading ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseEdit}
                                    className="rounded-full border border-[var(--accent-2)] px-5 py-3 text-sm font-semibold text-[var(--accent-2)]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodManager;
