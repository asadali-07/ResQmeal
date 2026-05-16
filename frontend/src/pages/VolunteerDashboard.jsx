import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LocateFixed, RefreshCw } from "lucide-react";
import MapPanel from "../components/MapPanel";
import QrScannerModal from "../components/QrScannerModal";
import {
    acceptClaim,
    getPendingClaims,
    getVolunteerAcceptedClaims,
    verifyDelivery,
    verifyPickup,
} from "../store/claimSlice";
import { joinRoom, leaveRoom, sendLocation } from "../socket/socket";
import { clearRoomLocations, setActiveRoom } from "../store/socketSlice";
import { createVolunteer, getUserVolunteer, updateVolunteer } from "../store/volunteerSlice";

const VolunteerDashboard = () => {
    const dispatch = useDispatch();
    const { items } = useSelector((state) => state.notificationReducer || { items: [] });
    const { userInfo } = useSelector((state) => state.userReducer);
    const { liveLocations } = useSelector((state) => state.socketReducer);
    const { volunteer, loading, error } = useSelector((state) => state.volunteerReducer);
    const {
        pendingClaims,
        acceptedClaims,
        loading: claimLoading,
        error: claimError,
        lastAction,
    } = useSelector((state) => state.claimReducer);
    const [claimId, setClaimId] = useState("");
    const [pickupToken, setPickupToken] = useState("");
    const [deliveryToken, setDeliveryToken] = useState("");
    const [roomFoodId, setRoomFoodId] = useState("");
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [isSharingLocation, setIsSharingLocation] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [scannerMode, setScannerMode] = useState("");
    const [locationMessage, setLocationMessage] = useState("");
    const watchIdRef = useRef(null);
    const { register, handleSubmit, reset, setValue } = useForm({
        defaultValues: {
            vehicleType: "bike",
            isAvailable: true,
        },
    });

    useEffect(() => {
        dispatch(getUserVolunteer());
    }, [dispatch]);

    useEffect(() => {
        if (volunteer) {
            const coords = volunteer.currentLocation?.coordinates || [];
            reset({
                vehicleType: volunteer.vehicleType || "bike",
                isAvailable: volunteer.isAvailable ?? true,
                lat: coords[1] || "",
                lng: coords[0] || "",
            });
            setIsEditing(false);
        }
    }, [reset, volunteer]);

    useEffect(() => {
        if (!volunteer) {
            return;
        }

        dispatch(getVolunteerAcceptedClaims());
    }, [dispatch, volunteer]);

    useEffect(() => {
        const coordinates = volunteer?.currentLocation?.coordinates;
        if (coordinates?.length !== 2) {
            return;
        }

        dispatch(getPendingClaims());
    }, [dispatch, volunteer]);

    useEffect(() => {
        if (!items.length || !volunteer) {
            return;
        }

        dispatch(getVolunteerAcceptedClaims());
    }, [dispatch, items.length, volunteer]);

    const workflowNotifications = items.filter((item) =>
        ["NEW_PICKUP", "CLAIM_ACCEPTED", "PICKUP_VERIFIED", "DELIVERY_VERIFIED"].includes(item.type)
    );

    useEffect(() => {
        if (!selectedPickup && acceptedClaims.length) {
            const firstAcceptedClaim =
                acceptedClaims.find((claimItem) =>
                    ["accepted", "picked_up"].includes(claimItem.status)
                ) || acceptedClaims[0];
            setSelectedPickup(firstAcceptedClaim);
            setClaimId(firstAcceptedClaim._id || "");
            setRoomFoodId(firstAcceptedClaim.foodId?._id || "");
            return;
        }

        if (!selectedPickup && pendingClaims.length) {
            const firstClaim = pendingClaims[0];
            setSelectedPickup(firstClaim);
            setSelectedClaim(firstClaim);
            setClaimId(firstClaim._id || "");
            setRoomFoodId(firstClaim.foodId?._id || "");
        }
    }, [acceptedClaims, pendingClaims, selectedPickup]);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!pendingClaims.length) {
            if (selectedClaim) {
                setSelectedClaim(null);
            }
            return;
        }

        if (!selectedClaim) {
            setSelectedClaim(pendingClaims[0]);
            return;
        }

        const nextSelectedClaim = pendingClaims.find(
            (claimItem) => String(claimItem._id) === String(selectedClaim._id)
        );

        if (!nextSelectedClaim) {
            setSelectedClaim(pendingClaims[0]);
            return;
        }

        if (nextSelectedClaim !== selectedClaim) {
            setSelectedClaim(nextSelectedClaim);
        }
    }, [pendingClaims, selectedClaim]);

    useEffect(() => {
        if (!selectedClaim) {
            return;
        }

        setSelectedPickup(selectedClaim);
        setClaimId(selectedClaim._id || "");
        setRoomFoodId(selectedClaim.foodId?._id || "");
    }, [selectedClaim]);

    useEffect(() => {
        if (!selectedPickup) {
            return;
        }

        const nextAcceptedClaim = acceptedClaims.find(
            (claimItem) => String(claimItem._id) === String(selectedPickup._id)
        );

        if (nextAcceptedClaim && nextAcceptedClaim !== selectedPickup) {
            setSelectedPickup(nextAcceptedClaim);
            setClaimId(nextAcceptedClaim._id || "");
            setRoomFoodId(nextAcceptedClaim.foodId?._id || "");
            return;
        }

        if (!nextAcceptedClaim && acceptedClaims.length && !selectedClaim) {
            const fallbackClaim =
                acceptedClaims.find((claimItem) =>
                    ["accepted", "picked_up"].includes(claimItem.status)
                ) || acceptedClaims[0];
            setSelectedPickup(fallbackClaim);
            setClaimId(fallbackClaim._id || "");
            setRoomFoodId(fallbackClaim.foodId?._id || "");
            return;
        }

        if (!nextAcceptedClaim && !acceptedClaims.length && !selectedClaim) {
            setSelectedPickup(null);
            setClaimId("");
            setRoomFoodId("");
        }
    }, [acceptedClaims, selectedClaim, selectedPickup]);

    const handleSelectAcceptedClaim = (claimItem) => {
        if (!claimItem) {
            return;
        }

        setSelectedPickup(claimItem);
        setClaimId(claimItem._id || "");
        setRoomFoodId(claimItem.foodId?._id || "");
    };

    const handleScanToken = (token) => {
        if (!token) {
            return;
        }

        if (scannerMode === "pickup") {
            setPickupToken(token);
        } else if (scannerMode === "delivery") {
            setDeliveryToken(token);
        }
    };

    const markers = useMemo(() => {
        if (!roomFoodId || !liveLocations?.[roomFoodId]) {
            return [];
        }
        return Object.entries(liveLocations[roomFoodId]).map(([userId, location]) => ({
            id: userId,
            longitude: location.lng,
            latitude: location.lat,
            label: userId.slice(0, 2).toUpperCase(),
            color: "var(--accent-2)",
        }));
    }, [liveLocations, roomFoodId]);

    const volunteerCoordinates = volunteer?.currentLocation?.coordinates || [];
    const selectedFood = selectedClaim?.foodId || null;
    const selectedWorkflowFood = selectedPickup?.foodId || selectedClaim?.foodId || null;
    const nearbyFoodMarkers = useMemo(() => {
        const claimMarkers = pendingClaims
            .filter((claimItem) => claimItem.foodId?.location?.coordinates?.length === 2)
            .map((claimItem) => ({
                id: claimItem._id,
                longitude: claimItem.foodId.location.coordinates[0],
                latitude: claimItem.foodId.location.coordinates[1],
                label: claimItem.foodId.name?.[0] || "F",
                title: claimItem.foodId.name,
                imageUrl: claimItem.foodId.foodImage?.thumbnail || claimItem.foodId.foodImage?.url,
                color: "var(--accent)",
                isActive: String(selectedClaim?._id) === String(claimItem._id),
                onClick: () => setSelectedClaim(claimItem),
            }));

        if (volunteerCoordinates.length === 2) {
            return [
                {
                    id: "volunteer-search-location",
                    longitude: Number(volunteerCoordinates[0]),
                    latitude: Number(volunteerCoordinates[1]),
                    label: "V",
                    title: "Your volunteer location",
                    color: "var(--accent-2)",
                    isActive: !selectedClaim,
                },
                ...claimMarkers,
            ];
        }

        return claimMarkers;
    }, [pendingClaims, selectedClaim, volunteerCoordinates]);

    const nearbyInitialViewState = useMemo(() => {
        if (selectedFood?.location?.coordinates?.length === 2) {
            return {
                latitude: selectedFood.location.coordinates[1],
                longitude: selectedFood.location.coordinates[0],
                zoom: 13,
            };
        }

        if (volunteerCoordinates.length === 2) {
            return {
                latitude: Number(volunteerCoordinates[1]),
                longitude: Number(volunteerCoordinates[0]),
                zoom: 12,
            };
        }

        return { latitude: 28.6139, longitude: 77.209, zoom: 4 };
    }, [selectedFood, volunteerCoordinates]);

    const liveRouteInitialViewState = useMemo(() => {
        if (markers.length) {
            return {
                latitude: markers[0].latitude,
                longitude: markers[0].longitude,
                zoom: 13,
            };
        }

        if (volunteerCoordinates.length === 2) {
            return {
                latitude: volunteerCoordinates[1],
                longitude: volunteerCoordinates[0],
                zoom: 12,
            };
        }

        return { latitude: 28.6139, longitude: 77.209, zoom: 4 };
    }, [markers, volunteerCoordinates]);

    const handleRefreshNearby = async () => {
        if (volunteerCoordinates.length !== 2) {
            return;
        }
        setLocationMessage("Refreshing nearby pending pickups from your volunteer location.");
        await dispatch(getPendingClaims());
    };

    const handleLocateVolunteer = () => {
        if (!navigator.geolocation) {
            setLocationMessage("Live location is not available in this browser.");
            return;
        }

        setLocationMessage("Finding your current location...");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const latitude = Number(position.coords.latitude.toFixed(6));
                const longitude = Number(position.coords.longitude.toFixed(6));
                const result = await dispatch(
                    updateVolunteer({
                        currentLocation: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                        },
                        vehicleType: volunteer?.vehicleType || "bike",
                        isAvailable: volunteer?.isAvailable ?? true,
                    })
                );

                if (result?.meta?.requestStatus === "fulfilled") {
                    setLocationMessage("Using your live location for nearby pickup search.");
                    await dispatch(getPendingClaims());
                }
            },
            () => {
                setLocationMessage("Location access was denied. Using your saved volunteer profile coordinates.");
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 }
        );
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "-";
        }
        return new Date(value).toLocaleString();
    };

    const formatRestaurantAddress = (address) => {
        if (!address) {
            return "";
        }

        if (typeof address === "string") {
            return address;
        }

        return address.formattedAddress || "";
    };

    const getRestaurantId = (restaurant) => {
        if (!restaurant) {
            return "";
        }

        return restaurant._id || "";
    };

    const getRestaurantInfoState = (restaurant, returnTo = "/volunteer") => ({
        restaurant,
        returnTo,
    });

    const handleAccept = async (claimItem) => {
        if (!claimItem?._id) {
            return;
        }

        const result = await dispatch(acceptClaim(claimItem._id));
        if (result?.meta?.requestStatus === "fulfilled") {
            const acceptedFoodId = claimItem.foodId?._id || "";
            setSelectedPickup({
                ...claimItem,
                status: "accepted",
            });
            setSelectedClaim(null);
            setClaimId(claimItem._id || "");
            setRoomFoodId(acceptedFoodId);
            if (acceptedFoodId) {
                joinRoom(acceptedFoodId);
                dispatch(setActiveRoom(acceptedFoodId));
                handleStartLiveSharing(acceptedFoodId);
            }
            await dispatch(getVolunteerAcceptedClaims());
            if (volunteerCoordinates.length === 2) {
                await dispatch(getPendingClaims());
            }
        }
    };

    const selectedPickupRestaurantName =
        selectedPickup?.restaurantName ||
        selectedPickup?.foodId?.restaurantId?.restaurantName ||
        selectedWorkflowFood?.restaurantId?.restaurantName ||
        "-";

    const selectedPickupFoodName =
        selectedPickup?.foodName || selectedPickup?.foodId?.name || selectedWorkflowFood?.name || "Selected pickup";

    const selectedPickupClaimId = selectedPickup?.claimId || selectedPickup?._id || "";

    const pendingRequestCards = pendingClaims.map((claimItem) => {
        const foodItem = claimItem.foodId;
        const restaurant = foodItem?.restaurantId;
        return {
            id: claimItem._id,
            claimId: claimItem._id,
            foodId: foodItem?._id,
            foodName: foodItem?.name,
            quantity: foodItem?.quantity,
            pickupAddress: restaurant?.address,
            restaurantName: restaurant?.restaurantName,
            restaurant,
            restaurantId: getRestaurantId(restaurant),
            foodItem,
            claimItem,
        };
    });
    const nearbyClaimCount = pendingClaims.length;

    const acceptedClaimCards = acceptedClaims.map((claimItem) => {
        const foodItem = claimItem.foodId;
        const restaurant = foodItem?.restaurantId;

        return {
            id: claimItem._id,
            claimId: claimItem._id,
            foodId: foodItem?._id,
            foodName: foodItem?.name,
            quantity: foodItem?.quantity,
            pickupAddress: restaurant?.address,
            restaurantName: restaurant?.restaurantName,
            restaurant,
            restaurantId: getRestaurantId(restaurant),
            status: claimItem.status,
            claimItem,
        };
    });

    const nearbyMapActions = (
        <>
            <button
                type="button"
                onClick={handleLocateVolunteer}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-2)] bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
            >
                <LocateFixed className="h-4 w-4" />
                Locate me
            </button>
            <button
                type="button"
                onClick={handleRefreshNearby}
                disabled={claimLoading || volunteerCoordinates.length !== 2}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
                <RefreshCw className={`h-4 w-4 ${claimLoading ? "animate-spin" : ""}`} />
                {claimLoading ? "Refreshing" : "Refresh"}
            </button>
        </>
    );

    const nearbyLegendItems = [
        { label: "Your volunteer location", color: "var(--accent-2)" },
        { label: "Pending pickup", color: "var(--accent)" },
    ];

    const handlePickupVerify = async () => {
        const result = await dispatch(verifyPickup({ claimId, pickupToken }));
        if (result?.meta?.requestStatus === "fulfilled") {
            setPickupToken("");
            await dispatch(getVolunteerAcceptedClaims());
            handleStartLiveSharing();
        }
    };

    const handleDeliveryVerify = async () => {
        const result = await dispatch(verifyDelivery({ claimId, deliveryToken }));
        if (result?.meta?.requestStatus === "fulfilled") {
            setDeliveryToken("");
            await dispatch(getVolunteerAcceptedClaims());
        }
    };

    const handleJoinRoom = () => {
        if (!roomFoodId) return;
        joinRoom(roomFoodId);
        dispatch(setActiveRoom(roomFoodId));
    };

    const handleLeaveRoom = () => {
        if (!roomFoodId) return;
        leaveRoom(roomFoodId);
        dispatch(clearRoomLocations(roomFoodId));
        dispatch(setActiveRoom(null));
        handleStopLiveSharing();
    };

    const handleSendLocation = () => {
        if (!roomFoodId) return;
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((position) => {
            sendLocation({
                foodId: roomFoodId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                userId: userInfo?._id || "volunteer",
            });
        });
    };

    const handleStartLiveSharing = (nextFoodId) => {
        const targetFoodId = nextFoodId || roomFoodId;

        if (!targetFoodId || !navigator.geolocation) {
            return;
        }

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (roomFoodId !== targetFoodId) {
            setRoomFoodId(targetFoodId);
        }

        joinRoom(targetFoodId);
        dispatch(setActiveRoom(targetFoodId));

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                sendLocation({
                    foodId: targetFoodId,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    userId: userInfo?._id || "volunteer",
                });
            },
            () => {},
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
        setIsSharingLocation(true);
        setLocationMessage("Sharing your live location with the restaurant and NGO.");
    };

    const handleStopLiveSharing = () => {
        if (watchIdRef.current !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsSharingLocation(false);
        setLocationMessage("Live location sharing is paused.");
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((position) => {
            setValue("lat", position.coords.latitude);
            setValue("lng", position.coords.longitude);
        });
    };

    const onSubmit = async (values) => {
        const currentLocation = {
            type: "Point",
            coordinates: [Number(values.lng), Number(values.lat)],
        };
        const payload = {
            currentLocation,
            vehicleType: values.vehicleType,
            isAvailable: values.isAvailable,
        };

        if (volunteer) {
            await dispatch(updateVolunteer(payload));
        } else {
            await dispatch(createVolunteer(payload));
        }
    };

    const showForm = !volunteer || isEditing;

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">
                        {volunteer ? "Volunteer control deck" : "Create volunteer profile"}
                    </h2>
                    <p className="text-sm text-[var(--muted)]">
                        {volunteer
                            ? "Accept pickups, verify tokens, and share your live route."
                            : "Set your vehicle and location before accepting pickups."}
                    </p>
                </div>
                {volunteer && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                    >
                        Edit profile
                    </button>
                )}
            </div>

            {showForm ? (
                <div className="glass-panel rounded-3xl border border-white/70 p-6">
                    <h3 className="font-display text-xl">Volunteer details</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Vehicle type</label>
                            <select
                                {...register("vehicleType", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            >
                                <option value="bike">Bike</option>
                                <option value="car">Car</option>
                                <option value="van">Van</option>
                            </select>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-semibold">Latitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register("lat", { required: true })}
                                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold">Longitude</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register("lng", { required: true })}
                                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleUseLocation}
                            className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-[var(--accent-2)]"
                        >
                            Use my location
                        </button>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...register("isAvailable")} />
                            Available for pickups
                        </label>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="flex-1 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                                disabled={loading}
                            >
                                {loading
                                    ? "Saving..."
                                    : volunteer
                                      ? "Update volunteer"
                                      : "Create volunteer"}
                            </button>
                            {volunteer && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="rounded-full border border-[var(--accent-2)] px-5 py-3 text-sm font-semibold text-[var(--accent-2)]"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <MapPanel
                            title="Pending pickups near you"
                            description="Pick a pending food marker to inspect the restaurant, plan the route, and accept the pickup when the request is available."
                            markers={nearbyFoodMarkers}
                            initialViewState={nearbyInitialViewState}
                            height={560}
                            headerActions={nearbyMapActions}
                            legendItems={nearbyLegendItems}
                        />
                        <div className="glass-panel rounded-3xl border border-white/70 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-display text-xl">Nearby pending food</h3>
                                    <p className="text-sm text-[var(--muted)]">
                                        Pick a marker to inspect the pending pickup details and jump into the route.
                                    </p>
                                </div>
                                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                    {nearbyClaimCount} nearby
                                </span>
                            </div>

                            <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                                {nearbyClaimCount} pending pickup
                                {nearbyClaimCount === 1 ? "" : "s"} within 5 km
                            </div>
                            {locationMessage && (
                                <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                                    {locationMessage}
                                </p>
                            )}

                            {selectedFood ? (
                                <div className="mt-4 space-y-4 rounded-3xl border border-white/80 bg-white/80 p-4">
                                    {selectedFood.foodImage?.url && (
                                        <img
                                            src={selectedFood.foodImage.url}
                                            alt={selectedFood.name}
                                            className="h-44 w-full rounded-2xl object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="text-lg font-semibold text-[var(--ink)]">
                                            {selectedFood.name}
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--muted)]">
                                            {selectedFood.description}
                                        </p>
                                    </div>
                                    <div className="grid gap-2 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--muted)]">Quantity</span>
                                            <span className="font-semibold text-[var(--ink)]">
                                                {selectedFood.quantity}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--muted)]">Status</span>
                                            <span className="font-semibold capitalize text-[var(--ink)]">
                                                {selectedFood.status || "pending"}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--muted)]">Pickup</span>
                                            <span className="font-semibold text-[var(--ink)]">
                                                {formatDateTime(selectedFood.pickupTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--muted)]">Expires</span>
                                            <span className="font-semibold text-[var(--ink)]">
                                                {formatDateTime(selectedFood.expiryTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-[var(--muted)]">Restaurant</span>
                                            <span className="text-right font-semibold text-[var(--ink)]">
                                                {selectedFood.restaurantId?.restaurantName || "-"}
                                            </span>
                                        </div>
                                    </div>
                                    {formatRestaurantAddress(selectedFood.restaurantId?.address) && (
                                        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--muted)]">
                                            {formatRestaurantAddress(selectedFood.restaurantId?.address)}
                                        </div>
                                    )}
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {getRestaurantId(selectedFood.restaurantId) ? (
                                            <Link
                                                to={`/restaurant-info/${getRestaurantId(selectedFood.restaurantId)}`}
                                                state={getRestaurantInfoState(selectedFood.restaurantId)}
                                                className="inline-flex items-center justify-center rounded-full border border-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent)]"
                                            >
                                                Restaurant info
                                            </Link>
                                        ) : null}
                                        <Link
                                            to={`/volunteer/route/${selectedFood._id}`}
                                            className="inline-flex items-center justify-center rounded-full border border-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-[var(--accent-2)]"
                                        >
                                            Show route
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleAccept(selectedClaim)}
                                            disabled={claimLoading || !selectedClaim?._id}
                                            className="rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
                                        >
                                            {selectedClaim?._id ? "Accept pickup" : "Waiting for request"}
                                        </button>
                                    </div>
                                    {!selectedClaim?._id && (
                                        <p className="text-xs text-[var(--muted)]">
                                            Select a pending claim to unlock volunteer actions.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-[var(--muted)]">
                                    No nearby pending food found for this volunteer location.
                                </p>
                            )}
                            {claimError && <p className="mt-3 text-sm text-red-500">{claimError}</p>}
                        </div>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="glass-panel rounded-3xl border border-white/70 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-display text-xl">Available delivery requests</h3>
                                    <p className="text-sm text-[var(--muted)]">
                                        These come from the pending claims endpoint, so each request is directly actionable.
                                    </p>
                                </div>
                                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                    {pendingRequestCards.length} open
                                </span>
                            </div>
                            <div className="mt-4 space-y-4">
                                {pendingRequestCards.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className="rounded-3xl border border-white/80 bg-white/80 p-4"
                                    >
                                        <p className="text-sm font-semibold text-[var(--ink)]">
                                            {notice.foodName || "New pickup request"}
                                        </p>
                                        <div className="mt-3 grid gap-2 text-xs text-[var(--muted)]">
                                            <p>Claim ID: {notice.claimId}</p>
                                            <p>Quantity: {notice.quantity || "-"}</p>
                                            {notice.pickupAddress?.formattedAddress && (
                                                <p>Pickup: {notice.pickupAddress.formattedAddress}</p>
                                            )}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {notice.restaurantId ? (
                                                <Link
                                                    to={`/restaurant-info/${notice.restaurantId}`}
                                                    state={getRestaurantInfoState(notice.restaurant)}
                                                    className="rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent)]"
                                                >
                                                    Restaurant info
                                                </Link>
                                            ) : null}
                                            <Link
                                                to={`/volunteer/route/${notice.foodId}`}
                                                onClick={() => {
                                                    setSelectedClaim(notice.claimItem);
                                                    setSelectedPickup(notice.claimItem);
                                                    setClaimId(notice.claimId || "");
                                                    setRoomFoodId(notice.foodId || "");
                                                }}
                                                className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
                                            >
                                                Show route
                                            </Link>
                                            <button
                                                onClick={() => handleAccept(notice.claimItem)}
                                                disabled={claimLoading}
                                                className="rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white"
                                            >
                                                Accept pickup
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {!pendingRequestCards.length && (
                                    <p className="text-sm text-[var(--muted)]">
                                        No pending claims nearby. Keep your volunteer profile available and refresh after NGOs create claims.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="glass-panel rounded-3xl border border-white/70 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="font-display text-xl">Accepted claims</h3>
                                    <p className="text-sm text-[var(--muted)]">
                                        These are the claims you accepted. Active ones can still share location and verify QR tokens.
                                    </p>
                                </div>
                                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--muted)]">
                                    {acceptedClaimCards.length} total
                                </span>
                            </div>
                            <div className="mt-4 space-y-4">
                                {acceptedClaimCards.map((notice) => (
                                    <div
                                        key={notice.id}
                                        className="rounded-3xl border border-white/80 bg-white/80 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--ink)]">
                                                    {notice.foodName || "Accepted pickup"}
                                                </p>
                                                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                                                    {notice.status}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                                                    ["accepted", "picked_up"].includes(notice.status)
                                                        ? "bg-[var(--accent-2)]/12 text-[var(--accent-2)]"
                                                        : notice.status === "delivered"
                                                          ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                                                          : "bg-red-100 text-red-500"
                                                }`}
                                            >
                                                {["accepted", "picked_up"].includes(notice.status) ? "Active" : notice.status}
                                            </span>
                                        </div>
                                        <div className="mt-3 grid gap-2 text-xs text-[var(--muted)]">
                                            <p>Claim ID: {notice.claimId}</p>
                                            <p>Restaurant: {notice.restaurantName || "-"}</p>
                                            <p>Quantity: {notice.quantity || "-"}</p>
                                            {notice.pickupAddress?.formattedAddress && (
                                                <p>Pickup: {notice.pickupAddress.formattedAddress}</p>
                                            )}
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectAcceptedClaim(notice.claimItem)}
                                                className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
                                            >
                                                Use in workflow
                                            </button>
                                            {notice.restaurantId ? (
                                                <Link
                                                    to={`/restaurant-info/${notice.restaurantId}`}
                                                    state={getRestaurantInfoState(notice.restaurant)}
                                                    className="rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent)]"
                                                >
                                                    Restaurant info
                                                </Link>
                                            ) : null}
                                            {["accepted", "picked_up"].includes(notice.status) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleSelectAcceptedClaim(notice.claimItem);
                                                        handleStartLiveSharing(notice.foodId);
                                                    }}
                                                    className="rounded-full bg-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-white"
                                                >
                                                    Share live location
                                                </button>
                                            )}
                                            <Link
                                                to={`/volunteer/route/${notice.foodId}`}
                                                onClick={() => handleSelectAcceptedClaim(notice.claimItem)}
                                                className="rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent)]"
                                            >
                                                Show route
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                                {!acceptedClaimCards.length && (
                                    <p className="text-sm text-[var(--muted)]">
                                        Accepted claims will appear here after you take a pickup.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Delivery workflow</h3>
                        {selectedPickup ? (
                            <div className="mt-3 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm">
                                <p className="font-semibold text-[var(--ink)]">
                                    {selectedPickupFoodName}
                                </p>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    Claim ID: {selectedPickupClaimId}
                                </p>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    Restaurant: {selectedPickupRestaurantName}
                                </p>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    Status: {selectedPickup.status || "accepted"}
                                </p>
                                {getRestaurantId(selectedWorkflowFood?.restaurantId) ? (
                                    <Link
                                        to={`/restaurant-info/${getRestaurantId(selectedWorkflowFood.restaurantId)}`}
                                        state={getRestaurantInfoState(selectedWorkflowFood.restaurantId)}
                                        className="mt-3 inline-flex rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent)]"
                                    >
                                        View restaurant info
                                    </Link>
                                ) : null}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-[var(--muted)]">
                                Select an accepted claim to scan the pickup or delivery QR code.
                            </p>
                        )}
                        <div className="mt-4 space-y-4">
                            <input
                                type="text"
                                placeholder="Claim ID"
                                value={claimId}
                                onChange={(event) => setClaimId(event.target.value)}
                                className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />

                            <div className="space-y-3 rounded-3xl border border-white/80 bg-white/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-[var(--ink)]">Pickup token</p>
                                    <button
                                        type="button"
                                        onClick={() => setScannerMode("pickup")}
                                        className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
                                    >
                                        Scan pickup QR
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Pickup token"
                                    value={pickupToken}
                                    onChange={(event) => setPickupToken(event.target.value)}
                                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                                <button
                                    onClick={handlePickupVerify}
                                    disabled={claimLoading || !claimId || !pickupToken}
                                    className="w-full rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Verify pickup
                                </button>
                            </div>

                            <div className="space-y-3 rounded-3xl border border-white/80 bg-white/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-[var(--ink)]">Delivery token</p>
                                    <button
                                        type="button"
                                        onClick={() => setScannerMode("delivery")}
                                        className="rounded-full border border-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--accent)]"
                                    >
                                        Scan delivery QR
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Delivery token"
                                    value={deliveryToken}
                                    onChange={(event) => setDeliveryToken(event.target.value)}
                                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                                <button
                                    onClick={handleDeliveryVerify}
                                    disabled={claimLoading || !claimId || !deliveryToken}
                                    className="w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Verify delivery
                                </button>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-[var(--muted)]">
                            You can scan the QR code directly from the restaurant or NGO screen, or paste the token manually.
                        </p>
                        {claimError && <p className="mt-3 text-sm text-red-500">{claimError}</p>}
                        {lastAction && (
                            <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                                {lastAction}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <MapPanel
                            title="Live route map"
                            description="Choose one of your accepted claims, then broadcast and view live locations in that food room."
                            markers={markers}
                            initialViewState={liveRouteInitialViewState}
                        />
                        <div className="glass-panel rounded-3xl border border-white/70 p-6">
                            <h3 className="font-display text-xl">Live tracking controls</h3>
                            <div className="mt-4 space-y-3">
                                <input
                                    type="text"
                                    placeholder="Food ID (room)"
                                    value={roomFoodId}
                                    onChange={(event) => setRoomFoodId(event.target.value)}
                                    className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                />
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={handleJoinRoom}
                                        className="rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Join room
                                    </button>
                                    <button
                                        onClick={handleLeaveRoom}
                                        className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-[var(--accent-2)]"
                                    >
                                        Leave room
                                    </button>
                                </div>
                                <button
                                    onClick={handleSendLocation}
                                    className="w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                                >
                                    Send my location
                                </button>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <button
                                        onClick={handleStartLiveSharing}
                                        disabled={!roomFoodId || isSharingLocation}
                                        className="rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        Start live sharing
                                    </button>
                                    <button
                                        onClick={handleStopLiveSharing}
                                        disabled={!isSharingLocation}
                                        className="rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500 disabled:opacity-50"
                                    >
                                        Stop sharing
                                    </button>
                                </div>
                                <p className="text-xs font-semibold text-[var(--muted)]">
                                    Live sharing: {isSharingLocation ? "On" : "Off"}
                                </p>
                                <p className="text-xs text-[var(--muted)]">
                                    Live sharing starts as soon as you accept a pickup. Keep this page open while you travel.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="font-display text-xl">Route updates</h3>
                            <span className="text-sm text-[var(--muted)]">
                                {workflowNotifications.length} updates
                            </span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {workflowNotifications.map((notice) => (
                                <div
                                    key={notice.id}
                                    className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm"
                                >
                                    <p className="font-semibold text-[var(--ink)]">
                                        {notice.message || "Workflow update"}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                        Claim: {notice.claimId || "-"}
                                    </p>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                        Food: {notice.foodName || notice.foodId || "-"}
                                    </p>
                                </div>
                            ))}
                            {!workflowNotifications.length && (
                                <p className="text-sm text-[var(--muted)]">
                                    Accepted pickups and verification updates will collect here.
                                </p>
                            )}
                        </div>
                    </div>

                    <QrScannerModal
                        open={Boolean(scannerMode)}
                        title={scannerMode === "delivery" ? "Scan delivery QR" : "Scan pickup QR"}
                        description={
                            scannerMode === "delivery"
                                ? "Scan the NGO delivery QR code to fill the delivery token."
                                : "Scan the restaurant pickup QR code to fill the pickup token."
                        }
                        onClose={() => setScannerMode("")}
                        onScan={(token) => {
                            handleScanToken(token);
                            setScannerMode("");
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default VolunteerDashboard;
