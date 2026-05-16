import { useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import {
    clearSelectedRestaurant,
    getRestaurantById,
} from "../store/restaurantSlice";

const formatAddress = (address) => {
    if (!address) {
        return "";
    }

    if (typeof address === "string") {
        return address;
    }

    return (
        address.formattedAddress ||
        [
            address.street,
            address.area,
            address.landmark,
            address.city,
            address.state,
            address.pincode,
            address.country,
        ]
            .filter(Boolean)
            .join(", ")
    );
};

const getOwnerId = (restaurant) => {
    if (!restaurant?.userId) {
        return "";
    }

    return typeof restaurant.userId === "object" ? restaurant.userId._id?.toString() : restaurant.userId?.toString();
};

const RestaurantInfo = () => {
    const { restaurantId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedRestaurant, loading, error } = useSelector(
        (state) => state.restaurantReducer
    );
    const { userInfo } = useSelector((state) => state.userReducer);
    const fallbackRestaurant = location.state?.restaurant || null;

    useEffect(() => {
        if (restaurantId) {
            dispatch(getRestaurantById(restaurantId));
        }

        return () => {
            dispatch(clearSelectedRestaurant());
        };
    }, [dispatch, restaurantId]);

    const restaurant = selectedRestaurant || fallbackRestaurant;
    const address = useMemo(() => formatAddress(restaurant?.address), [restaurant]);
    const restaurantOwnerId = getOwnerId(restaurant);
    const canMessageRestaurant = userInfo?.role === "ngo" && restaurantOwnerId;

    const handleMessageRestaurant = () => {
        if (!canMessageRestaurant) {
            return;
        }

        navigate("/messages", {
            state: {
                recipientUserId: restaurantOwnerId.toString(),
                recipientName: restaurant.restaurantName || "Restaurant",
                recipientProfileImage: restaurant.restaurantPicture,
            },
        });
    };

    if (loading && !restaurant) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Loading restaurant information...</p>
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                    {error || "Restaurant information is not available for this pickup yet."}
                </p>
                <NavLink
                    to="/"
                    className="mt-4 inline-flex rounded-full border border-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent)]"
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
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent)]">
                        Pickup partner
                    </p>
                    <h2 className="mt-2 font-display text-3xl">
                        {restaurant.restaurantName || "Restaurant information"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                        Review pickup details before coordinating the food handoff.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (location.state?.returnTo) {
                            navigate(location.state.returnTo);
                            return;
                        }
                        navigate(-1);
                    }}
                    className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                >
                    Back
                </button>
            </div>

            {error && fallbackRestaurant ? (
                <div className="glass-panel rounded-3xl border border-white/70 p-5 text-sm text-[var(--muted)]">
                    Showing the restaurant details from the selected food card because the live fetch did not complete:
                    {" "}
                    {error}
                </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="glass-panel overflow-hidden rounded-3xl border border-white/70">
                    {restaurant.restaurantPicture?.url ? (
                        <img
                            src={restaurant.restaurantPicture.url}
                            alt={restaurant.restaurantName}
                            className="h-72 w-full object-cover"
                        />
                    ) : (
                        <div className="grid h-72 place-items-center bg-[linear-gradient(135deg,rgba(255,122,26,0.18),rgba(35,155,86,0.16))]">
                            <span className="font-display text-6xl text-[var(--accent)]">
                                {(restaurant.restaurantName || "R").slice(0, 1).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="p-6">
                        <h3 className="font-display text-xl">About this restaurant</h3>
                        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                            {restaurant.restaurantDescription || "No description has been added yet."}
                        </p>
                        {userInfo?.role === "ngo" ? (
                            <button
                                type="button"
                                onClick={handleMessageRestaurant}
                                disabled={!canMessageRestaurant}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent-2)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                <MessageCircle className="h-4 w-4" />
                                Message restaurant
                            </button>
                        ) : null}
                        {userInfo?.role === "ngo" && !restaurantOwnerId ? (
                            <p className="mt-3 text-xs text-[var(--muted)]">
                                Messaging will appear once this restaurant includes its owner account ID.
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Pickup details</h3>
                        <div className="mt-5 grid gap-3 text-sm">
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span className="text-[var(--muted)]">Opening time</span>
                                <span className="font-semibold text-[var(--ink)]">
                                    {restaurant.openingTime || "-"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span className="text-[var(--muted)]">Closing time</span>
                                <span className="font-semibold text-[var(--ink)]">
                                    {restaurant.closingTime || "-"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span className="text-[var(--muted)]">Food license</span>
                                <span className="font-semibold text-[var(--ink)]">
                                    {restaurant.foodLicenseNumber || "-"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Address</h3>
                        <p className="mt-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
                            {address || "Address is not available."}
                        </p>
                        {restaurant.location?.coordinates?.length === 2 ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                                        Latitude
                                    </p>
                                    <p className="mt-2 font-semibold text-[var(--ink)]">
                                        {restaurant.location.coordinates[1]}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm">
                                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                                        Longitude
                                    </p>
                                    <p className="mt-2 font-semibold text-[var(--ink)]">
                                        {restaurant.location.coordinates[0]}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantInfo;
