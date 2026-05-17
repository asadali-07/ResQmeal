import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import MapPanel from "../components/MapPanel";
import {
  createRestaurant,
  getUserRestaurant,
  updateRestaurant,
} from "../store/restaurantSlice";

const RestaurantDashboard = () => {
  const dispatch = useDispatch();
  const { restaurant, loading, error } = useSelector(
    (state) => state.restaurantReducer,
  );
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      country: "India",
    },
  });

  useEffect(() => {
    dispatch(getUserRestaurant());
  }, [dispatch]);

  useEffect(() => {
    if (restaurant) {
      reset({
        restaurantName: restaurant.restaurantName || "",
        restaurantDescription: restaurant.restaurantDescription || "",
        foodLicenseNumber: restaurant.foodLicenseNumber || "",
        openingTime: restaurant.openingTime || "",
        closingTime: restaurant.closingTime || "",
        street: restaurant.address?.street || "",
        area: restaurant.address?.area || "",
        landmark: restaurant.address?.landmark || "",
        city: restaurant.address?.city || "",
        state: restaurant.address?.state || "",
        pincode: restaurant.address?.pincode || "",
        country: restaurant.address?.country || "India",
      });
      setIsEditing(false);
    }
  }, [restaurant, reset]);

  const onSubmit = async (values) => {
    const payload = {
      restaurantName: values.restaurantName,
      restaurantDescription: values.restaurantDescription,
      foodLicenseNumber: values.foodLicenseNumber,
      openingTime: values.openingTime,
      closingTime: values.closingTime,
      restaurantPicture: values.restaurantPicture?.[0],
      address: {
        street: values.street,
        area: values.area,
        landmark: values.landmark,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        country: values.country,
      },
    };

    if (restaurant) {
      await dispatch(updateRestaurant(payload));
    } else {
      await dispatch(createRestaurant(payload));
    }
  };

  const marker = useMemo(() => {
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
        color: "var(--accent)",
      },
    ];
  }, [restaurant]);

  const initialViewState = useMemo(() => {
    if (marker.length) {
      return {
        longitude: marker[0].longitude,
        latitude: marker[0].latitude,
        zoom: 13,
      };
    }
    return {
      longitude: 77.209,
      latitude: 28.6139,
      zoom: 4,
    };
  }, [marker]);

  const showForm = !restaurant || isEditing;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">
            {restaurant
              ? "Restaurant command center"
              : "Create restaurant profile"}
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {restaurant
              ? "Keep your profile sharp and list surplus food quickly."
              : "Register your pickup details so NGOs can find you."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {restaurant && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-full border border-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-[var(--accent-2)]"
            >
              Edit profile
            </button>
          )}
          <NavLink
            to="/restaurant/food"
            className="rounded-full bg-[var(--accent-2)] px-5 py-2 text-sm font-semibold text-white"
          >
            Manage food listings
          </NavLink>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {showForm ? (
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">
              {restaurant ? "Edit profile details" : "Profile details"}
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Update once and we will map your pickup coordinates.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold">Restaurant name</label>
                <input
                  type="text"
                  {...register("restaurantName", { required: true })}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  rows="3"
                  {...register("restaurantDescription", { required: true })}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">
                    Food license number
                  </label>
                  <input
                    type="text"
                    {...register("foodLicenseNumber", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">
                    Restaurant picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    {...register("restaurantPicture")}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Opening time</label>
                  <input
                    type="time"
                    {...register("openingTime", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Closing time</label>
                  <input
                    type="time"
                    {...register("closingTime", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Street</label>
                  <input
                    type="text"
                    {...register("street", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Area</label>
                  <input
                    type="text"
                    {...register("area", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Landmark</label>
                  <input
                    type="text"
                    {...register("landmark", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">City</label>
                  <input
                    type="text"
                    {...register("city", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">State</label>
                  <input
                    type="text"
                    {...register("state", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Pincode</label>
                  <input
                    type="text"
                    {...register("pincode", { required: true })}
                    className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Country</label>
                <input
                  type="text"
                  {...register("country", { required: true })}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : restaurant
                      ? "Update restaurant"
                      : "Create restaurant"}
                </button>
                {restaurant && (
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
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">Profile snapshot</h3>

            <p className="text-sm text-(--muted)">
              Your pickup details are live for nearby NGOs.
            </p>

            <div className="px-4 py-3">
              {restaurant?.restaurantPicture ? (
                <img
                  src={restaurant.restaurantPicture.url}
                  alt="Restaurant"
                  className="h-auto w-full rounded-5xl object-cover"
                />
              ) : (
                <span className="font-semibold text-(--ink)">-</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-(--muted)">
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Restaurant</span>
                <p className="font-semibold text-[var(--ink)] break-words">
                  {restaurant?.restaurantName || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>License</span>
                <p className="font-semibold text-[var(--ink)] break-words">
                  {restaurant?.foodLicenseNumber || "-"}
                </p>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Description</span>
                <p className="font-semibold text-[var(--ink)] break-words">
                  {restaurant?.restaurantDescription || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Opening Time</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.openingTime || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Closing Time</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.closingTime || "-"}
                </p>
              </div>

              <div className="sm:col-span-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Pickup Window</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.openingTime && restaurant?.closingTime
                    ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                    : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Street</span>
                <p className="font-semibold text-[var(--ink)] break-words">
                  {restaurant?.address?.street || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Area</span>
                <p className="font-semibold text-[var(--ink)] break-words">
                  {restaurant?.address?.area || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Landmark</span>
                <p className="font-semibold text-[var(--ink)] break-words">
                  {restaurant?.address?.landmark || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>City</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.address?.city || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>State</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.address?.state || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Pincode</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.address?.pincode || "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Country</span>
                <p className="font-semibold text-[var(--ink)]">
                  {restaurant?.address?.country || "India"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <MapPanel
            title="Your pickup location"
            description="We pin this spot for NGO and volunteer routing."
            markers={marker}
            initialViewState={initialViewState}
          />
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">Status snapshot</h3>
            <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Profile</span>
                <span className="font-semibold text-[var(--ink)]">
                  {restaurant ? "Active" : "Not created"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Pickup window</span>
                <span className="font-semibold text-[var(--ink)]">
                  {restaurant?.openingTime && restaurant?.closingTime
                    ? `${restaurant.openingTime} - ${restaurant.closingTime}`
                    : "Set times"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Food listings</span>
                <span className="font-semibold text-[var(--ink)]">
                  Manage in food tab
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
