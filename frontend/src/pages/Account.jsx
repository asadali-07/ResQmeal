import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserRestaurant } from "../store/restaurantSlice";
import { clearError, getUserInfo, sendOtp, updateProfile, verifyOtp } from "../store/userSlice";

const roleHomeMap = {
    restaurant: "/restaurant",
    ngo: "/ngo",
    volunteer: "/volunteer",
    admin: "/",
};

const Account = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo, isAuthenticated, loading, verifying, error } = useSelector(
        (state) => state.userReducer
    );
    const { restaurant, loading: restaurantLoading } = useSelector((state) => state.restaurantReducer);
    const [otp, setOtp] = useState("");
    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (!isAuthenticated && !userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, isAuthenticated, userInfo]);

    useEffect(() => {
        if (userInfo) {
            reset({
                name: userInfo.name || "",
                phone: userInfo.phone || "",
            });
        }
    }, [reset, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "restaurant") {
            dispatch(getUserRestaurant());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const roleHome = useMemo(() => roleHomeMap[userInfo?.role] || "/", [userInfo]);
    const isEmailVerified = Boolean(userInfo?.isVerified);

    const restaurantAddress =
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

    const onSubmit = async (values) => {
        const payload = {
            name: values.name,
            phone: values.phone,
            profileImage: values.profileImage?.[0],
        };

        await dispatch(updateProfile(payload));
    };

    const handleSendOtp = async () => {
        await dispatch(sendOtp());
    };

    const handleVerifyOtp = async () => {
        if (!otp.trim()) {
            return;
        }

        const result = await dispatch(verifyOtp(otp.trim()));
        if (result?.meta?.requestStatus === "fulfilled") {
            setOtp("");
        }
    };

    if (!userInfo && loading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Loading your account...</p>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Please login to manage your account.</p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl">Account</h2>
                    <p className="text-sm text-[var(--muted)]">
                        Manage your profile details and verify your email so protected role actions work.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => navigate(roleHome)}
                    className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
                >
                    Back to dashboard
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
                <div className="glass-panel rounded-3xl border border-white/70 p-6">
                    <h3 className="font-display text-xl">Profile details</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold">Name</label>
                            <input
                                type="text"
                                {...register("name", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Email</label>
                            <input
                                type="email"
                                value={userInfo.email || ""}
                                disabled
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-[var(--muted)]"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Phone</label>
                            <input
                                type="text"
                                {...register("phone", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Profile image</label>
                            <input
                                type="file"
                                accept="image/*"
                                {...register("profileImage")}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2"
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                        >
                            {loading ? "Saving..." : "Update profile"}
                        </button>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Verification</h3>
                        <div className="mt-4 space-y-4">
                            <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm">
                                <p className="text-[var(--muted)]">Current status</p>
                                <p className="mt-2 font-semibold text-[var(--ink)]">
                                    {isEmailVerified ? "Verified" : "Not verified"}
                                </p>
                            </div>
                            {isEmailVerified ? (
                                <p className="rounded-2xl bg-[var(--accent)]/10 px-4 py-3 text-sm font-semibold text-[var(--accent)]">
                                    Your email is verified. OTP actions are hidden because no more verification is needed.
                                </p>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={verifying}
                                        className="w-full rounded-full border border-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-[var(--accent-2)]"
                                    >
                                        {verifying ? "Sending..." : "Send OTP to email"}
                                    </button>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(event) => setOtp(event.target.value)}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={verifying || !otp.trim()}
                                        className="w-full rounded-full bg-[var(--accent-2)] px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        {verifying ? "Verifying..." : "Verify email"}
                                    </button>
                                    <p className="text-xs text-[var(--muted)]">
                                        Restaurant, NGO, and volunteer profile creation uses your backend verification gate.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/70 p-6">
                        <h3 className="font-display text-xl">Account snapshot</h3>
                        <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Role</span>
                                <span className="font-semibold uppercase text-[var(--ink)]">
                                    {userInfo.role || "-"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Email verification</span>
                                <span className="font-semibold text-[var(--ink)]">
                                    {isEmailVerified ? "Complete" : "Pending"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                <span>Main workspace</span>
                                <Link to={roleHome} className="font-semibold text-[var(--accent-2)]">
                                    Open
                                </Link>
                            </div>
                        </div>
                    </div>

                    {userInfo.role === "restaurant" ? (
                        <div className="glass-panel rounded-3xl border border-white/70 p-6">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="font-display text-xl">Restaurant profile</h3>
                                <Link
                                    to="/restaurant"
                                    className="rounded-full border border-[var(--accent-2)] px-4 py-2 text-xs font-semibold text-[var(--accent-2)]"
                                >
                                    Edit workspace
                                </Link>
                            </div>
                            {restaurant ? (
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                        <span>Restaurant</span>
                                        <span className="font-semibold text-[var(--ink)]">
                                            {restaurant.restaurantName || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                        <span>License</span>
                                        <span className="font-semibold text-[var(--ink)]">
                                            {restaurant.foodLicenseNumber || "-"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                                        <span>Pickup window</span>
                                        <span className="font-semibold text-[var(--ink)]">
                                            {restaurant.openingTime && restaurant.closingTime
                                                ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                                                : "-"}
                                        </span>
                                    </div>
                                    {restaurantAddress ? (
                                        <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--muted)]">
                                            {restaurantAddress}
                                        </div>
                                    ) : null}
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Link
                                            to="/restaurant/location"
                                            className="inline-flex items-center justify-center rounded-full bg-[var(--accent-2)] px-4 py-2 text-sm font-semibold text-white"
                                        >
                                            Show pickup location
                                        </Link>
                                        <Link
                                            to="/restaurant/claims"
                                            className="inline-flex items-center justify-center rounded-full border border-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent)]"
                                        >
                                            Open claims
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                                    <p>
                                        {restaurantLoading
                                            ? "Loading restaurant profile..."
                                            : "No restaurant profile found yet."}
                                    </p>
                                    <Link
                                        to="/restaurant"
                                        className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Create restaurant profile
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Account;
