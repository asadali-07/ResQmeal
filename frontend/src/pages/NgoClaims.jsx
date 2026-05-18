import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import TokenQrCard from "../components/TokenQrCard";
import { cancelClaim, getNgoClaimedFoods } from "../store/claimSlice";
import { getUserNgo } from "../store/ngoSlice";
import { getUserInfo } from "../store/userSlice";

const NgoClaims = () => {
    const dispatch = useDispatch();
    const { userInfo, loading: userLoading } = useSelector((state) => state.userReducer);
    const { ngo, loading: ngoLoading } = useSelector((state) => state.ngoReducer);
    const { claimedFoods, loading: claimLoading, error: claimError } = useSelector(
        (state) => state.claimReducer
    );
    const { items: notifications } = useSelector(
        (state) => state.notificationReducer || { items: [] }
    );

    console.log(claimedFoods);

    useEffect(() => {
        if (!userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "ngo") {
            dispatch(getUserNgo());
            dispatch(getNgoClaimedFoods());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (notifications.length && userInfo?.role === "ngo") {
            dispatch(getNgoClaimedFoods());
        }
    }, [dispatch, notifications.length, userInfo]);

    const formatDateTime = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleString();
    };

    const activeClaims = useMemo(
        () =>
            (claimedFoods || []).filter((claimItem) =>
                ["pending", "accepted", "picked_up"].includes(claimItem.status)
            ),
        [claimedFoods]
    );

    const completedClaims = useMemo(
        () =>
            (claimedFoods || []).filter((claimItem) =>
                ["delivered", "cancelled"].includes(claimItem.status)
            ),
        [claimedFoods]
    );

    const deliveryNoticeByClaimId = useMemo(() => {
        return new Map(
            notifications
                .filter((item) => item.type === "CLAIM_ACCEPTED" || item.type === "DELIVERY_VERIFIED")
                .map((item) => [String(item.claimId), item])
        );
    }, [notifications]);

    const canTrackVolunteer = (status) => status === "accepted" || status === "picked_up";

    const renderClaimCard = (claimItem) => {
        const foodItem = claimItem.foodId;
        const deliveryNotice = deliveryNoticeByClaimId.get(String(claimItem._id));

        return (
            <div
                key={claimItem._id}
                className="rounded-3xl border border-white/80 bg-white/80 p-5 text-sm"
            >
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
                        <p className="mt-1 text-xs text-[var(--muted)]">
                            Claim ID: {claimItem._id}
                        </p>
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
                <p className="mt-3 text-xs text-[var(--muted)]">
                    {foodItem?.restaurantId?.restaurantName || "Restaurant pending"}
                </p>
                <div className="mt-4 grid gap-2">
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Quantity</span>
                        <span className="font-semibold text-[var(--ink)]">
                            {foodItem?.quantity || "-"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Pickup</span>
                        <span className="font-semibold text-[var(--ink)]">
                            {formatDateTime(foodItem?.pickupTime)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-[var(--muted)]">Claimed at</span>
                        <span className="font-semibold text-[var(--ink)]">
                            {formatDateTime(claimItem.createdAt)}
                        </span>
                    </div>
                </div>
                {deliveryNotice?.deliveryToken ? (
                    <div className="mt-4">
                        <TokenQrCard
                            title="Delivery token"
                            token={deliveryNotice.deliveryToken}
                            description="Show this QR to the volunteer at final handoff."
                        />
                    </div>
                ) : null}
                <div className="mt-4 grid gap-2">
                    {canTrackVolunteer(claimItem.status) && foodItem?._id ? (
                        <Link
                            to={`/ngo/track/${foodItem._id}`}
                            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white"
                        >
                            Track volunteer
                        </Link>
                    ) : null}
                    {foodItem?._id && claimItem.status !== "cancelled" && claimItem.status !== "delivered" ? (
                        <Link
                            to={`/ngo/route/${foodItem._id}`}
                            className="inline-flex w-full items-center justify-center rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
                        >
                            Show route
                        </Link>
                    ) : null}
                    {!["delivered", "cancelled"].includes(claimItem.status) ? (
                        <button
                            type="button"
                            onClick={() => dispatch(cancelClaim(claimItem._id)).then(() => dispatch(getNgoClaimedFoods()))}
                            disabled={claimLoading}
                            className="w-full rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500"
                        >
                            Cancel claim
                        </button>
                    ) : null}
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
                <p className="text-sm text-[var(--muted)]">Please login to access NGO claims.</p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    if (userInfo.role !== "ngo") {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">This space is reserved for NGO partners.</p>
                <NavLink
                    to="/"
                    className="mt-4 inline-flex rounded-full border border-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent)]"
                >
                    Back to home
                </NavLink>
            </div>
        );
    }

    if (!ngo && ngoLoading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Loading NGO profile...</p>
            </div>
        );
    }

    if (!ngo) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                    Complete your NGO profile before viewing claimed foods.
                </p>
                <NavLink
                    to="/ngo"
                    className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                    Open NGO setup
                </NavLink>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Claimed foods</h2>
                    <p className="text-sm text-[var(--muted)]">
                        Review every food claim from your NGO and track volunteers once a pickup is accepted.
                    </p>
                </div>
                <Link
                    to="/ngo"
                    className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                >
                    Back to NGO map
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="glass-panel rounded-3xl border border-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        All claims
                    </p>
                    <p className="mt-3 font-display text-3xl text-[var(--ink)]">{claimedFoods.length}</p>
                </div>
                <div className="glass-panel rounded-3xl border border-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        Active
                    </p>
                    <p className="mt-3 font-display text-3xl text-[var(--ink)]">{activeClaims.length}</p>
                </div>
                <div className="glass-panel rounded-3xl border border-white/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                        Closed
                    </p>
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
                        <h3 className="font-display text-xl">Active claims</h3>
                        <p className="text-sm text-[var(--muted)]">
                            Pending, accepted, and picked-up claims that may still need action.
                        </p>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{activeClaims.length} active</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {activeClaims.map(renderClaimCard)}
                    {!activeClaims.length ? (
                        <p className="text-sm text-[var(--muted)]">
                            No active claims right now. New claims will appear here after you claim food from the map.
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h3 className="font-display text-xl">Completed and cancelled</h3>
                        <p className="text-sm text-[var(--muted)]">
                            Delivered and cancelled claim history for your NGO.
                        </p>
                    </div>
                    <span className="text-sm text-[var(--muted)]">{completedClaims.length} closed</span>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2 overflow-y-auto h-96">
                    {completedClaims.map(renderClaimCard)}
                    {!completedClaims.length ? (
                        <p className="text-sm text-[var(--muted)]">
                            Delivered or cancelled claims will appear here over time.
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default NgoClaims;
