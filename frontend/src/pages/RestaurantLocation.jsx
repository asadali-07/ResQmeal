import { useEffect, useMemo } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MapPanel from "../components/MapPanel";
import { getUserRestaurant } from "../store/restaurantSlice";
import { getUserInfo } from "../store/userSlice";

const RestaurantLocation = () => {
    const dispatch = useDispatch();
    const { userInfo, loading: userLoading } = useSelector((state) => state.userReducer);
    const { restaurant, loading, error } = useSelector((state) => state.restaurantReducer);

    useEffect(() => {
        if (!userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "restaurant") {
            dispatch(getUserRestaurant());
        }
    }, [dispatch, userInfo]);

    const markers = useMemo(() => {
        const coords = restaurant?.location?.coordinates;
        if (!coords || coords.length !== 2) {
            return [];
        }

        return [
            {
                id: restaurant._id || "restaurant",
                longitude: coords[0],
                latitude: coords[1],
                label: restaurant.restaurantName?.[0] || "R",
                title: restaurant.restaurantName || "Pickup location",
                color: "var(--accent)",
            },
        ];
    }, [restaurant]);

    const initialViewState = useMemo(() => {
        if (markers.length) {
            return {
                longitude: markers[0].longitude,
                latitude: markers[0].latitude,
                zoom: 13,
            };
        }

        return { longitude: 77.209, latitude: 28.6139, zoom: 4 };
    }, [markers]);

    const address =
        restaurant?.address?.formattedAddress ||
        [
            restaurant?.address?.street,
            restaurant?.address?.area,
            restaurant?.address?.landmark,
            restaurant?.address?.city,
            restaurant?.address?.state,
            restaurant?.address?.pincode,
            restaurant?.address?.country,
        ]
            .filter(Boolean)
            .join(", ");

    if (!userInfo && userLoading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">Checking your account...</p>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">Please login to access the pickup map.</p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    if (userInfo.role !== "restaurant") {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">This space is reserved for restaurant partners.</p>
                <NavLink
                    to="/"
                    className="mt-4 inline-flex rounded-full border border-(--accent) px-5 py-3 text-sm font-semibold text-(--accent)"
                >
                    Back to home
                </NavLink>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Pickup location</h2>
                    <p className="text-sm text-(--muted)">
                        Review the exact map pin NGOs and volunteers use for pickup routing.
                    </p>
                </div>
                <Link
                    to="/account"
                    className="rounded-full border border-(--accent-2) px-5 py-2 text-sm font-semibold text-(--accent-2)"
                >
                    Back to account
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <MapPanel
                    title={restaurant?.restaurantName || "Pickup point"}
                    description="This is the pickup location published from your restaurant profile."
                    markers={markers}
                    initialViewState={initialViewState}
                    height={560}
                    legendItems={[{ label: "Restaurant pickup point", color: "var(--accent)" }]}
                />

                <div className="glass-panel rounded-3xl border border-white/70 p-6">
                    <h3 className="font-display text-xl">Location summary</h3>
                    {restaurant ? (
                        <div className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Restaurant</span>
                                <span className="font-semibold text-(--ink)">
                                    {restaurant.restaurantName || "-"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Pickup window</span>
                                <span className="font-semibold text-(--ink)">
                                    {restaurant.openingTime && restaurant.closingTime
                                        ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                                        : "-"}
                                </span>
                            </div>
                            {address ? (
                                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-(--muted)">
                                    {address}
                                </div>
                            ) : null}
                            <Link
                                to="/restaurant"
                                className="inline-flex w-full items-center justify-center rounded-full border border-(--accent) px-4 py-2 text-sm font-semibold text-(--accent)"
                            >
                                Edit restaurant profile
                            </Link>
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-(--muted)">
                            {loading ? "Loading pickup location..." : "Restaurant profile not found yet."}
                        </p>
                    )}
                    {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
                </div>
            </div>
        </div>
    );
};

export default RestaurantLocation;
