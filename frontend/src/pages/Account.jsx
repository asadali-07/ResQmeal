import { useEffect, useMemo, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserRestaurant } from "../store/restaurantSlice";
import { getUserNgo } from "../store/ngoSlice";
import {
  clearError,
  getUserInfo,
  sendOtp,
  updateProfile,
  verifyOtp,
} from "../store/userSlice";

const roleHomeMap = {
  restaurant: "/restaurant",
  ngo: "/ngo",
  volunteer: "/volunteer",
  admin: "/dashboard",
};

const Account = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated, loading, verifying, error } = useSelector(
    (state) => state.userReducer,
  );
  const { restaurant, loading: restaurantLoading } = useSelector(
    (state) => state.restaurantReducer,
  );
  const { ngo, loading: ngoLoading } = useSelector((state) => state.ngoReducer);
  const { volunteer } = useSelector((state) => state.volunteerReducer);
  const [otp, setOtp] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      phone: "",
    },
  });

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
  }, [userInfo, reset]);

  useEffect(() => {
    if (userInfo?.role === "restaurant") {
      dispatch(getUserRestaurant());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    if (userInfo?.role === "ngo") {
      dispatch(getUserNgo());
    }
  }, [dispatch, userInfo]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const roleHome = useMemo(
    () => roleHomeMap[userInfo?.role] || "/",
    [userInfo],
  );
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

  const ngoAddress =
    ngo?.address?.formattedAddress ||
    [
      ngo?.address?.street,
      ngo?.address?.area,
      ngo?.address?.landmark,
      ngo?.address?.city,
      ngo?.address?.state,
      ngo?.address?.pincode,
      ngo?.address?.country,
    ]
      .filter(Boolean)
      .join(", ");

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      profileImage: selectedFile,
    };

    await dispatch(updateProfile(payload));

    setIsEditing(false);
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
        <p className="text-sm text-(--muted)">Loading your account...</p>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
        <p className="text-sm text-(--muted)">
          Please login to manage your account.
        </p>
        <NavLink
          to="/login"
          className="mt-4 inline-flex rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white"
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
          <p className="text-sm text-(--muted)">
            Manage your profile details and verify your email so protected role
            actions work.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(roleHome)}
          className="rounded-full border border-(--accent-2) px-5 py-2 text-sm font-semibold text-(--accent-2)"
        >
          Back to dashboard
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-3xl border border-white/70 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl">Profile Details</h3>
          </div>

          <div className="mt-6">
            {!isEditing ? (
              // ================= VIEW MODE =================
              <div className="space-y-5">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      userInfo?.profileImage?.url ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="Profile"
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <h3 className="text-lg">{userInfo?.name}</h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <h3 className="text-lg">{userInfo?.email}</h3>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <h3 className="text-lg">
                    {userInfo?.phone || "Not added"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full bg-(--accent) px-5 py-2 text-sm font-semibold text-white"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              // ================= EDIT MODE =================
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      selectedFile
                        ? URL.createObjectURL(selectedFile)
                        : userInfo?.profileImage?.url ||
                          "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="Profile"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-28 w-28 cursor-pointer rounded-full border-4 border-white object-cover shadow-lg hover:opacity-80"
                  />

                  <p className="mt-2 text-xs text-gray-500">
                    Click image to change
                  </p>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Name</label>

                  <input
                    type="text"
                    {...register("name")}
                    className="mt-2 w-full rounded-2xl border border-white/70 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">Phone</label>

                  <input
                    type="text"
                    {...register("phone")}
                    className="mt-2 w-full rounded-2xl border border-white/70 px-4 py-3"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);

                      reset({
                        name: userInfo?.name || "",
                        phone: userInfo?.phone || "",
                      });
                    }}
                    className="rounded-full border border-red-400 px-5 py-2 text-sm font-semibold text-red-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">Verification</h3>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm">
                <p className="text-(--muted)">Current status</p>
                <p className="mt-2 font-semibold text-(--ink)">
                  {isEmailVerified ? "Verified" : "Not verified"}
                </p>
              </div>
              {isEmailVerified ? (
                <p className="rounded-2xl bg-(--accent)/10 px-4 py-3 text-sm font-semibold text-(--accent)">
                  Your email is verified. OTP actions are hidden because no more
                  verification is needed.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={verifying}
                    className="w-full rounded-full border border-(--accent-2) px-4 py-3 text-sm font-semibold text-(--accent-2)"
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
                    className="w-full rounded-full bg-(--accent-2) px-4 py-3 text-sm font-semibold text-white"
                  >
                    {verifying ? "Verifying..." : "Verify email"}
                  </button>
                  <p className="text-xs text-(--muted)">
                    Restaurant, NGO, and volunteer profile creation uses your
                    backend verification gate.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">Account snapshot</h3>
            <div className="mt-4 grid gap-3 text-sm text-(--muted)">
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Role</span>
                <span className="font-semibold uppercase text-(--ink)">
                  {userInfo.role || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Email verification</span>
                <span className="font-semibold text-(--ink)">
                  {isEmailVerified ? "Complete" : "Pending"}
                </span>
              </div>
              {userInfo.role === "volunteer" && (
                <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                  <span>Total deliveries</span>
                  <span className="font-semibold text-(--ink)">
                    {volunteer?.totalDeliveries || 0}
                  </span>
                </div>
              )}
              {userInfo.role === "volunteer" && (
                <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                  <span>Vehicle Type</span>
                  <span className="font-semibold text-(--ink)">
                    {volunteer?.vehicleType}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Main workspace</span>
                <Link to={roleHome} className="font-semibold text-(--accent-2)">
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
                  className="rounded-full border border-(--accent-2) px-4 py-2 text-xs font-semibold text-(--accent-2)"
                >
                  Edit workspace
                </Link>
              </div>
              {restaurant ? (
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>Restaurant</span>
                    <span className="font-semibold text-(--ink)">
                      {restaurant.restaurantName || "-"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>License</span>
                    <span className="font-semibold text-(--ink)">
                      {restaurant.foodLicenseNumber || "-"}
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
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>totalDonations</span>
                    <span className="font-semibold text-(--ink)">
                      {restaurant.totalDonations} Meals
                    </span>
                  </div>
                  {restaurantAddress ? (
                    <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-(--muted)">
                      {restaurantAddress}
                    </div>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      to="/restaurant/location"
                      className="inline-flex items-center justify-center rounded-full bg-(--accent-2) px-4 py-2 text-sm font-semibold text-white"
                    >
                      Show pickup location
                    </Link>
                    <Link
                      to="/restaurant/claims"
                      className="inline-flex items-center justify-center rounded-full border border-(--accent) px-4 py-2 text-sm font-semibold text-(--accent)"
                    >
                      Open claims
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-(--muted)">
                  <p>
                    {restaurantLoading
                      ? "Loading restaurant profile..."
                      : "No restaurant profile found yet."}
                  </p>
                  <Link
                    to="/restaurant"
                    className="inline-flex rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white"
                  >
                    Create restaurant profile
                  </Link>
                </div>
              )}
            </div>
          ) : null}
          {userInfo.role === "ngo" ? (
            <div className="glass-panel rounded-3xl border border-white/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-xl">NGO profile</h3>

                <Link
                  to="/ngo"
                  className="rounded-full border border-(--accent-2) px-4 py-2 text-xs font-semibold text-(--accent-2)"
                >
                  Edit workspace
                </Link>
              </div>

              {ngo ? (
                <div className="mt-4 space-y-3 text-sm">
                  {/* NGO Name */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>NGO</span>

                    <span className="font-semibold text-(--ink)">
                      {ngo.ngoName || "-"}
                    </span>
                  </div>

                  {/* Registration Number */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>Registration</span>

                    <span className="font-semibold text-(--ink)">
                      {ngo.registrationNumber || "-"}
                    </span>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>Capacity</span>

                    <span className="font-semibold text-(--ink)">
                      {ngo.capacity || "-"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                    <span>totalMealsReceived</span>

                    <span className="font-semibold text-(--ink)">
                      {ngo.totalMealsReceived} Meals
                    </span>
                  </div>

                  {/* Address */}
                  {ngoAddress ? (
                    <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-(--muted)">
                      {ngoAddress}
                    </div>
                  ) : null}

                  <div className="grid gap-2 sm:grid-cols-2">
                    <Link
                      to="/ngo"
                      className="inline-flex items-center justify-center rounded-full bg-(--accent-2) px-4 py-2 text-sm font-semibold text-white"
                    >
                      Show NGO Map
                    </Link>

                    <Link
                      to="/ngo/claims"
                      className="inline-flex items-center justify-center rounded-full border border-(--accent) px-4 py-2 text-sm font-semibold text-(--accent)"
                    >
                      Open claims
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-sm text-(--muted)">
                  <p>
                    {ngoLoading
                      ? "Loading NGO profile..."
                      : "No NGO profile found yet."}
                  </p>

                  <Link
                    to="/ngo"
                    className="inline-flex rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white"
                  >
                    Create NGO profile
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
