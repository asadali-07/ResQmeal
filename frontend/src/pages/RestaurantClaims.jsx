import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import TokenQrCard from "../components/TokenQrCard";
import { getRestaurantClaims } from "../store/claimSlice";
import { getUserRestaurant } from "../store/restaurantSlice";
import { getUserInfo } from "../store/userSlice";

const RestaurantClaims = () => {
    const dispatch = useDispatch();
    const { userInfo, loading: userLoading } = useSelector((state) => state.userReducer);
    const { restaurant, loading: restaurantLoading } = useSelector((state) => state.restaurantReducer);
    const { restaurantClaims, loading: claimLoading, error: claimError } = useSelector(
        (state) => state.claimReducer
    );
    const { items: notifications } = useSelector(
        (state) => state.notificationReducer || { items: [] }
    );

    useEffect(() => {
        if (!userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "restaurant") {
            dispatch(getUserRestaurant());
            dispatch(getRestaurantClaims());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (notifications.length && userInfo?.role === "restaurant") {
            dispatch(getRestaurantClaims());
        }
    }, [dispatch, notifications.length, userInfo]);

    const pickupNoticeByFoodId = useMemo(() => {
        return new Map(
            notifications
                .filter((item) => item.type === "CLAIM_ACCEPTED" || item.type === "PICKUP_VERIFIED")
                .map((item) => [String(item.foodId), item])
        );
    }, [notifications]);

    const activeClaims = useMemo(
        () =>
            (restaurantClaims || []).filter((claimItem) =>
                ["accepted", "picked_up"].includes(claimItem.status)
            ),
        [restaurantClaims]
    );

    const completedClaims = useMemo(
        () => (restaurantClaims || []).filter((claimItem) => claimItem.status === "delivered"),
        [restaurantClaims]
    );

    const cancelledClaims = useMemo(
        () => (restaurantClaims || []).filter((claimItem) => claimItem.status === "cancelled"),
        [restaurantClaims]
    );

    const formatDateTime = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleString();
    };

    const renderClaimCard = (claimItem) => {
        const foodItem = claimItem.foodId;
        const pickupNotice = pickupNoticeByFoodId.get(String(foodItem?._id));

        return (
            <div key={claimItem._id} className="rounded-3xl border border-white/80 bg-white/80 p-5 text-sm">
                {foodItem?.foodImage?.url && (
                    <img
                        src={foodItem.foodImage.url}
                        alt={foodItem.name}
                        className="mb-4 h-36 w-full rounded-2xl object-cover"
                    />
                )}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-base font-semibold text-[var(--ink)]">
                            {foodItem?.name || "Claimed food"}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">Claim ID: {claimItem._id}</p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                            claimItem.status === "delivered"
                                ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                                : claimItem.status === "cancelled"
                                  ? "bg-red-100 text-red-500"
                                  : "bg-[var(--accent-2)]/15 text-[var(--accent-2)]"
                        }`}
                    >
                        {claimItem.status}
                    </span>
                </div>

                <div className="mt-4 grid gap-2">
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Quantity</span>
                        <span className="font-semibold text-[var(--ink)]">{foodItem?.quantity || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Pickup time</span>
                        <span className="font-semibold text-[var(--ink)]">{formatDateTime(foodItem?.pickupTime)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Accepted at</span>
                        <span className="font-semibold text-[var(--ink)]">{formatDateTime(claimItem.acceptedAt)}</span>
                    </div>
                </div>

                {pickupNotice?.pickupToken ? (
                    <div className="mt-4">
                        <TokenQrCard
                            title="Pickup token"
                            token={pickupNotice.pickupToken}
                            description="Show this QR to the volunteer during pickup verification."
                        />
                    </div>
                ) : null}

                <div className="mt-4 grid gap-2">
                    {foodItem?._id ? (
                        <Link
                            to={`/restaurant/track/${foodItem._id}`}
                            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white"
                        >
                            Track volunteer
                        </Link>
                    ) : null}
                    <Link
                        to="/restaurant/food"
                        className="inline-flex w-full items-center justify-center rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
                    >
                        Open food manager
                    </Link>
                </div>
            </div>
        );
    };

    if (!userInfo && userLoading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Checking your account...</p>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Please login to access restaurant claims.</p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    if (userInfo.role !== "restaurant") {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">This space is reserved for restaurant partners.</p>
                <NavLink
                    to="/"
                    className="mt-4 inline-flex rounded-full border border-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent)]"
                >
                    Back to home
                </NavLink>
            </div>
        );
    }

    if (!restaurant && restaurantLoading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Loading restaurant profile...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Restaurant claims</h2>
                    <p className="text-sm text-[var(--muted)]">
                        Follow NGO claims and volunteer pickup progress without crowding the food listing workspace.
                    </p>
                </div>
                <Link
                    to="/restaurant/food"
                    className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                >
                    Back to food manager
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-panel rounded-3xl border border-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">All claims</p>
                    <p className="mt-3 font-display text-3xl text-[var(--ink)]">{restaurantClaims.length}</p>
                </div>
                <div className="glass-panel rounded-3xl border border-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Active</p>
                    <p className="mt-3 font-display text-3xl text-[var(--ink)]">{activeClaims.length}</p>
                </div>
                <div className="glass-panel rounded-3xl border border-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Delivered</p>
                    <p className="mt-3 font-display text-3xl text-[var(--ink)]">{completedClaims.length}</p>
                </div>
            </div>

            {claimError ? (
                <div className="glass-panel rounded-3xl border border-white/70 p-5 text-sm text-red-500">
                    {claimError}
                </div>
            ) : null}

            <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-display text-xl">Active claim flow</h3>
                        <p className="text-sm text-[var(--muted)]">
                            Accepted and picked-up claims that may still need live tracking or pickup verification.
                        </p>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{activeClaims.length} active</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {activeClaims.map(renderClaimCard)}
                    {!activeClaims.length ? (
                        <p className="text-sm text-[var(--muted)]">
                            NGO claims will appear here after a volunteer accepts pickup.
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-display text-xl">Delivered history</h3>
                        <p className="text-sm text-[var(--muted)]">Completed claim handoffs for your restaurant.</p>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{completedClaims.length} delivered</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {completedClaims.map(renderClaimCard)}
                    {!completedClaims.length ? (
                        <p className="text-sm text-[var(--muted)]">
                            Delivered claim history will appear here over time.
                        </p>
                    ) : null}
                </div>
            </div>
            <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-display text-xl">Cancelled history</h3>
                        <p className="text-sm text-[var(--muted)]">Cancelled claim requests for your restaurant.</p>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{cancelledClaims.length} cancelled</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {cancelledClaims.map(renderClaimCard)}
                    {!cancelledClaims.length ? (
                        <p className="text-sm text-[var(--muted)]">
                            Cancelled claim history will appear here over time.
                        </p>
                    ) : null}
                </div>
            </div>

            {claimLoading ? (
                <p className="text-sm text-[var(--muted)]">Loading restaurant claims...</p>
            ) : null}
        </div>
    );
};

export default RestaurantClaims;
