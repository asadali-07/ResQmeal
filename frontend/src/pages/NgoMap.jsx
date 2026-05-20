import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import MapPanel from "../components/MapPanel";
import TokenQrCard from "../components/TokenQrCard";
import {
  cancelClaim,
  createClaim,
  getNgoClaimedFoods,
} from "../store/claimSlice";
import { getAvailableFood } from "../store/foodSlice";
import { createNgo, getUserNgo, updateNgo } from "../store/ngoSlice";

const NgoMap = () => {
  const dispatch = useDispatch();
  const {
    availableFoods,
    loading: foodLoading,
    error: foodError,
  } = useSelector((state) => state.foodReducer);
  const {
    ngo,
    loading: ngoLoading,
    error: ngoError,
  } = useSelector((state) => state.ngoReducer);
  const {
    volunteers,
    loading: claimLoading,
    error: claimError,
  } = useSelector((state) => state.claimReducer);
  const { items: notifications } = useSelector(
    (state) => state.notificationReducer || { items: [] },
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const coords = useMemo(() => {
    const profileCoordinates = ngo?.location?.coordinates;

    if (profileCoordinates?.length !== 2) {
      return { lat: "", lng: "" };
    }

    return {
      lat: profileCoordinates[1],
      lng: profileCoordinates[0],
    };
  }, [ngo]);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      country: "India",
    },
  });

  const selectedFood = useMemo(() => {
    if (!availableFoods.length) return null;

    return (
      availableFoods.find(
        (food) => String(food._id) === String(selectedFoodId),
      ) || availableFoods[0]
    );
  }, [availableFoods, selectedFoodId]);

  useEffect(() => {
    dispatch(getUserNgo());
    dispatch(getNgoClaimedFoods());
  }, [dispatch]);

  useEffect(() => {
    if (ngo) {
      reset({
        ngoName: ngo.ngoName || "",
        ngoDescription: ngo.ngoDescription || "",
        registrationNumber: ngo.registrationNumber || "",
        capacity: ngo.capacity || "",
        street: ngo.address?.street || "",
        area: ngo.address?.area || "",
        landmark: ngo.address?.landmark || "",
        city: ngo.address?.city || "",
        state: ngo.address?.state || "",
        pincode: ngo.address?.pincode || "",
        country: ngo.address?.country || "India",
      });
    }
  }, [ngo, reset]);

  useEffect(() => {
    if (!ngo) {
      return;
    }

    const profileCoordinates = ngo.location?.coordinates;

    if (profileCoordinates?.length !== 2) {
      return;
    }

    const latitude = profileCoordinates[1];
    const longitude = profileCoordinates[0];

    dispatch(getAvailableFood({ latitude, longitude }));
  }, [dispatch, ngo]);

  const markers = useMemo(() => {
    const foodMarkers = availableFoods
      .filter((food) => food.location?.coordinates?.length === 2)
      .map((food) => ({
        id: food._id,
        longitude: food.location.coordinates[0],
        latitude: food.location.coordinates[1],
        label: food.name?.[0] || "F",
        title: food.name,
        imageUrl: food.foodImage?.thumbnail || food.foodImage?.url,
        color: "var(--accent-2)",
        isActive: String(selectedFood?._id) === String(food._id),
        onClick: () => setSelectedFoodId(food._id),
      }));
    if (coords.lat && coords.lng) {
      return [
        {
          id: "ngo-location",
          longitude: Number(coords.lng),
          latitude: Number(coords.lat),
          label: "N",
          title: "Your NGO location",
          color: "var(--accent)",
          isActive: !selectedFood,
        },
        ...foodMarkers,
      ];
    }

    return foodMarkers;
  }, [availableFoods, coords, selectedFood]);

  const initialViewState = useMemo(() => {
    if (selectedFood?.location?.coordinates?.length === 2) {
      return {
        latitude: selectedFood.location.coordinates[1],
        longitude: selectedFood.location.coordinates[0],
        zoom: 13,
      };
    }
    if (coords.lat && coords.lng) {
      return {
        latitude: Number(coords.lat),
        longitude: Number(coords.lng),
        zoom: 12,
      };
    }
    return { latitude: 28.6139, longitude: 77.209, zoom: 4 };
  }, [coords, selectedFood]);

  const handleRefresh = async () => {
    if (!coords.lat || !coords.lng) {
      return;
    }
    setLocationMessage("Refreshing nearby food for the current map center.");
    await dispatch(
      getAvailableFood({
        latitude: Number(coords.lat),
        longitude: Number(coords.lng),
      }),
    );
  };

  const handleClaim = async (food) => {
    const foodId = typeof food === "string" ? food : food?._id;
    const result = await dispatch(createClaim(foodId));
    if (result?.meta?.requestStatus === "fulfilled") {
      dispatch(getNgoClaimedFoods());
      if (coords.lat && coords.lng) {
        dispatch(
          getAvailableFood({
            latitude: Number(coords.lat),
            longitude: Number(coords.lng),
          }),
        );
      }
    }
  };

  const handleCancelClaim = async () => {
    if (!claimStatusNotice.claimId) {
      return;
    }
    const result = await dispatch(cancelClaim(claimStatusNotice.claimId));
    if (
      result?.meta?.requestStatus === "fulfilled" &&
      coords.lat &&
      coords.lng
    ) {
      dispatch(getNgoClaimedFoods());
      dispatch(
        getAvailableFood({
          latitude: Number(coords.lat),
          longitude: Number(coords.lng),
        }),
      );
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }
    return new Date(value).toLocaleString();
  };

  const formatAddress = (address) => {
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

  const getRestaurantInfoState = (restaurant, returnTo = "/ngo") => ({
    restaurant,
    returnTo,
  });

  const getVolunteerInfoState = (volunteer, returnTo = "/ngo") => ({
    volunteer,
    returnTo,
  });

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    [notifications],
  );

  const claimStatusNotice = sortedNotifications.find(
    (item) =>
      item.type === "CLAIM_ACCEPTED" ||
      item.type === "CLAIM_CANCELLED" ||
      item.type === "PICKUP_VERIFIED" ||
      item.type === "CLAIM_CREATED" ||
      item.type === "DELIVERY_VERIFIED",
  );

  const deliveryHandoffNotices = sortedNotifications.filter(
    (item) =>
      item.type === "DELIVERY_VERIFIED" ||
      item.type === "PICKUP_VERIFIED" ||
      item.type === "CLAIM_ACCEPTED" ||
      item.type === "CLAIM_CANCELLED",
  );

  const currentClaimStatus =
    claimStatusNotice?.type === "CLAIM_CANCELLED"
      ? "cancelled"
      : claimStatusNotice?.type === "CLAIM_ACCEPTED"
        ? "accepted"
        : claimStatusNotice?.type === "PICKUP_VERIFIED"
          ? "picked up"
          : claimStatusNotice?.type === "DELIVERY_VERIFIED"
            ? "delivered"
            : claimStatusNotice?.type === "CLAIM_CREATED"
              ? "pending"
              : null;

  const isSelectedClaimed =
    claimStatusNotice?.foodId &&
    selectedFood?._id &&
    String(claimStatusNotice.foodId) === String(selectedFood._id) &&
    currentClaimStatus !== "cancelled";

  const onSubmit = async (values) => {
    const payload = {
      ngoName: values.ngoName,
      ngoDescription: values.ngoDescription,
      registrationNumber: values.registrationNumber,
      capacity: Number(values.capacity),
      ngoPicture: values.ngoPicture?.[0],
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

    let result;

    if (ngo) {
      result = await dispatch(updateNgo(payload));
    } else {
      result = await dispatch(createNgo(payload));
    }

    if (result?.meta?.requestStatus === "fulfilled") {
      setIsEditing(false);
    }
  };

  const showForm = !ngo || isEditing;

  const mapHeaderActions = (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={foodLoading}
      className="inline-flex items-center gap-2 rounded-full bg-(--accent-2) px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${foodLoading ? "animate-spin" : ""}`} />

      {foodLoading ? "Refreshing" : "Refresh"}
    </button>
  );
  const mapLegendItems = [
    { label: "Your NGO base", color: "var(--accent)" },
    { label: "Nearby food pickup", color: "var(--accent-2)" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl">
            {ngo ? "NGO live map" : "Create NGO profile"}
          </h2>
          <p className="text-sm text- (--muted)">
            {ngo
              ? "Find surplus meals within 5 km and claim instantly."
              : "Register your NGO so claims can be verified."}
          </p>
        </div>
        {ngo && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-(--accent-2) px-5 py-2 text-sm font-semibold text-(--accent-2)"
          >
            Edit profile
          </button>
        )}
      </div>

      {showForm ? (
        <div className="glass-panel rounded-3xl border border-white/70 p-6">
          <h3 className="font-display text-xl">NGO details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-semibold">NGO name</label>
              <input
                type="text"
                {...register("ngoName", { required: true })}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
              />
            </div>
            <div>
              <label className="text-sm font-semibold">Description</label>
              <textarea
                rows="3"
                {...register("ngoDescription", { required: true })}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold">
                  Registration number
                </label>
                <input
                  type="text"
                  {...register("registrationNumber", { required: true })}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                />
              </div>
              <div>
                <label className="text-sm font-semibold">
                  Capacity (meals)
                </label>
                <input
                  type="number"
                  {...register("capacity", { required: true })}
                  className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold">NGO picture</label>
              <input
                type="file"
                accept="image/*"
                {...register("ngoPicture")}
                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-2"
              />
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
            {ngoError && <p className="text-sm text-red-500">{ngoError}</p>}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="flex-1 rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white"
                disabled={ngoLoading}
              >
                {ngoLoading ? "Saving..." : ngo ? "Update NGO" : "Create NGO"}
              </button>
              {ngo && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-full border border-(--accent-2) px-5 py-3 text-sm font-semibold text-(--accent-2)"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">Profile snapshot</h3>

            <p className="text-sm text-(--muted)">
              Your NGO details are live for nearby restaurants and volunteers.
            </p>

            <div className="px-4 py-3">
              {ngo?.ngoPicture ? (
                <img
                  src={ngo.ngoPicture.url}
                  alt="NGO"
                  className="h-auto w-full rounded-5xl object-cover"
                />
              ) : (
                <span className="font-semibold text-(--ink)">-</span>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm text-(--muted)">
              {/* NGO Name */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>NGO</span>

                <p className="font-semibold text-(--ink) wrap-break-word">
                  {ngo?.ngoName || "-"}
                </p>
              </div>

              {/* Registration */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Registration</span>

                <p className="font-semibold text-(--ink) wrap-break-word">
                  {ngo?.registrationNumber || "-"}
                </p>
              </div>

              {/* Description */}
              <div className="sm:col-span-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Description</span>

                <p className="font-semibold text-(--ink) wrap-break-word">
                  {ngo?.ngoDescription || "-"}
                </p>
              </div>

              {/* Capacity */}
              <div className="sm:col-span-2 rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Capacity</span>

                <p className="font-semibold text-(--ink)">
                  {ngo?.capacity || "-"} meals
                </p>
              </div>

              {/* Street */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Street</span>

                <p className="font-semibold text-(--ink) wrap-break-word">
                  {ngo?.address?.street || "-"}
                </p>
              </div>

              {/* Area */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Area</span>

                <p className="font-semibold text-(--ink) wrap-break-word">
                  {ngo?.address?.area || "-"}
                </p>
              </div>

              {/* Landmark */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Landmark</span>

                <p className="font-semibold text-(--ink) wrap-break-word">
                  {ngo?.address?.landmark || "-"}
                </p>
              </div>

              {/* City */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>City</span>

                <p className="font-semibold text-(--ink)">
                  {ngo?.address?.city || "-"}
                </p>
              </div>

              {/* State */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>State</span>

                <p className="font-semibold text-(--ink)">
                  {ngo?.address?.state || "-"}
                </p>
              </div>

              {/* Pincode */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Pincode</span>

                <p className="font-semibold text-(--ink)">
                  {ngo?.address?.pincode || "-"}
                </p>
              </div>

              {/* Country */}
              <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span>Country</span>

                <p className="font-semibold text-(--ink)">
                  {ngo?.address?.country || "India"}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <MapPanel
              title="Available food near your NGO"
              description="Your NGO base is marked with N. Active pickup markers expand on the map so they are easier to spot."
              markers={markers}
              initialViewState={initialViewState}
              height={560}
              headerActions={mapHeaderActions}
              legendItems={mapLegendItems}
            />

            <div className="space-y-4">
              <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl">
                      NGO search location
                    </h3>

                    <p className="mt-1 text-sm text-(--muted)">
                      Nearby food listings are automatically fetched using your
                      NGO profile coordinates.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                        Latitude
                      </p>

                      <p className="mt-2 text-sm font-semibold text-(--ink)">
                        {coords.lat || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                        Longitude
                      </p>

                      <p className="mt-2 text-sm font-semibold text-(--ink)">
                        {coords.lng || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent-2) px-5 py-3 text-sm font-semibold text-white"
                  disabled={foodLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${foodLoading ? "animate-spin" : ""}`}
                  />

                  {foodLoading ? "Refreshing..." : "Refresh available food"}
                </button>

                {locationMessage && (
                  <p className="mt-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-(--muted)">
                    {locationMessage}
                  </p>
                )}

                {foodError && (
                  <p className="mt-3 text-sm text-red-500">{foodError}</p>
                )}
              </div>

              <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-xl">Selected food</h3>
                    <p className="mt-1 text-sm text-(--muted)">
                      The card updates from the map so you can review the pickup
                      before claiming it.
                    </p>
                  </div>
                  {selectedFood && (
                    <span className="rounded-full bg-(--accent-2)/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--accent-2)">
                      {selectedFood.status || "available"}
                    </span>
                  )}
                </div>
                {selectedFood ? (
                  <div className="mt-4 space-y-4">
                    {selectedFood.foodImage?.url && (
                      <img
                        src={selectedFood.foodImage.url}
                        alt={selectedFood.name}
                        className="h-44 w-full rounded-2xl object-cover"
                      />
                    )}
                    <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-(--ink)">
                            {selectedFood.name}
                          </p>
                          <p className="mt-1 text-sm text-(--muted)">
                            {selectedFood.description}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-(--accent)/10 px-4 py-3 text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-(--muted)">
                            Meals
                          </p>
                          <p className="mt-1 text-2xl font-display text-(--ink)">
                            {selectedFood.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                          Pickup window
                        </p>
                        <p className="mt-2 font-semibold text-(--ink)">
                          {formatDateTime(selectedFood.pickupTime)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/80 bg-white/80 p-4 text-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                          Expires
                        </p>
                        <p className="mt-2 font-semibold text-(--ink)">
                          {formatDateTime(selectedFood.expiryTime)}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,244,235,0.96))] p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--muted)">
                            Pickup point
                          </p>
                          <p className="mt-2 text-base font-semibold text-(--ink)">
                            {selectedFood.restaurantId?.restaurantName ||
                              "Restaurant"}
                          </p>
                        </div>
                        {getRestaurantId(selectedFood.restaurantId) ? (
                          <Link
                            to={`/restaurant-info/${getRestaurantId(selectedFood.restaurantId)}`}
                            state={getRestaurantInfoState(
                              selectedFood.restaurantId,
                            )}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-(--accent) shadow-sm transition hover:-translate-y-0.5"
                          >
                            Restaurant info
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-(--accent) shadow-sm">
                            Route ready
                          </span>
                        )}
                      </div>
                      {formatAddress(selectedFood.restaurantId?.address) && (
                        <p className="mt-3 text-sm leading-6 text-(--muted)">
                          {formatAddress(selectedFood.restaurantId?.address)}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link
                        to={`/ngo/route/${selectedFood._id}`}
                        className="inline-flex items-center justify-center rounded-full border border-(--accent-2) px-4 py-3 text-sm font-semibold text-(--accent-2)"
                      >
                        Show route
                      </Link>
                      <button
                        onClick={() => handleClaim(selectedFood)}
                        disabled={claimLoading || isSelectedClaimed}
                        className="rounded-full bg-(--accent) px-4 py-3 text-sm font-semibold text-white"
                      >
                        {isSelectedClaimed ? "Claim created" : "Claim food"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-(--muted)">
                    Select a food marker or listing to see details.
                  </p>
                )}
              </div>

              <div className="glass-panel rounded-3xl border border-white/70 p-6">
                <h3 className="font-display text-xl">Claim status</h3>
                {currentClaimStatus ? (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                      <p className="font-semibold text-(--ink)">
                        {selectedFood?.name || "Claimed food"}
                      </p>
                      {claimStatusNotice?.claimId && (
                        <p className="mt-1 text-xs text-(--muted)">
                          Claim ID: {claimStatusNotice.claimId}
                        </p>
                      )}
                      <span className="mt-3 inline-flex rounded-full bg-(--accent-2) px-3 py-1 text-xs font-semibold uppercase text-white">
                        {currentClaimStatus}
                      </span>
                    </div>
                    {getRestaurantId(selectedFood?.restaurantId) ? (
                      <Link
                        to={`/restaurant-info/${getRestaurantId(selectedFood?.restaurantId)}`}
                        state={getRestaurantInfoState(
                          selectedFood?.restaurantId,
                          "/ngo",
                        )}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-(--accent)"
                      >
                        View restaurant info
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                    {currentClaimStatus == "pending" && (
                      <button
                        onClick={handleCancelClaim}
                        disabled={claimLoading}
                        className="w-full rounded-full border border-red-400 px-4 py-2 text-sm font-semibold text-red-500"
                      >
                        Cancel claim
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-(--muted)">
                    No claim created yet.
                  </p>
                )}
                {claimError && (
                  <p className="mt-3 text-sm text-red-500">{claimError}</p>
                )}
                {volunteers?.length ? (
                  <p className="mt-2 text-sm text-(--muted)">
                    {volunteers.length} volunteers alerted.
                  </p>
                ) : null}
                {deliveryHandoffNotices.length > 0 && (
                  <div className="mt-5 space-y-3  overflow-y-auto max-h-90">
                    <p className="text-xs font-semibold uppercase text-(--muted)">
                      Delivery handoff
                    </p>

                    {deliveryHandoffNotices.map((notice) => (
                      <div
                        key={notice._id || notice.id}
                        className="rounded-2xl border flex flex-col gap-2 border-orange-100 bg-white p-4 text-sm shadow-md ring-1 ring-orange-50"
                      >
                        <p className="font-semibold text-(--ink)">
                          {notice.message || "Delivery update"}
                        </p>

                        <p className="text-xs text-(--muted)">
                          Food: {notice.foodName || notice.foodId || "-"}
                        </p>

                        {notice.volunteerId ? (
                          <Link
                            to={`/volunteer-info/${notice.volunteerId}`}
                            state={getVolunteerInfoState(notice.volunteer)}
                            className="rounded-full w-30 border border-(--accent) px-4 py-2 text-xs font-semibold text-(--accent)"
                          >
                            Volunteer info
                          </Link>
                        ) : null}

                        {notice.restaurantId ? (
                          <Link
                            to={`/restaurant-info/${getRestaurantId(
                              notice.restaurantId,
                            )}`}
                            state={getRestaurantInfoState(
                              notice.restaurantId,
                              "/ngo",
                              notice.restaurantId,
                            )}
                            className="rounded-full w-32 border border-(--accent) px-4 py-2 text-xs font-semibold text-(--accent)"
                          >
                            Restaurant info
                          </Link>
                        ) : null}

                        {notice.deliveryToken && (
                          <div className="mt-3">
                            <TokenQrCard
                              title="Delivery token"
                              token={notice.deliveryToken}
                              description="Show this QR to the volunteer at final handoff."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  to="/ngo/claims"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-full border border-(--accent-2) px-4 py-2 text-sm font-semibold text-(--accent-2)"
                >
                  Open claimed foods page
                </Link>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Pickup listings</h3>
              <span className="text-sm text-(--muted)">
                {availableFoods.length} spots
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {availableFoods.map((food) => (
                <div
                  key={food._id}
                  onClick={() => setSelectedFoodId(food._id)}
                  className={`relative cursor-pointer rounded-3xl border bg-white/80 p-5 transition ${
                    String(selectedFood?._id) === String(food._id)
                      ? "border-(--accent-2) shadow-xl shadow-orange-100"
                      : "border-white/80 hover:-translate-y-0.5 hover:border-(--accent-2)/40"
                  }`}
                >
                  {getRestaurantId(food.restaurantId) ? (
                    <Link
                      to={`/restaurant-info/${getRestaurantId(food.restaurantId)}`}
                      state={getRestaurantInfoState(food.restaurantId)}
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-(--accent) shadow-sm transition hover:-translate-y-0.5"
                    >
                      Restaurant info
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                  {food.foodImage?.url && (
                    <img
                      src={food.foodImage.url}
                      alt={food.name}
                      className="mb-4 h-36 w-full rounded-2xl object-cover"
                    />
                  )}
                  <p className="text-lg font-semibold text-(--ink)">
                    {food.name}
                  </p>
                  <p className="mt-2 text-sm text-(--muted)">
                    {food.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-(--muted)">Quantity</span>
                    <span className="font-semibold text-(--ink)">
                      {food.quantity}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-(--muted)">
                    <span>
                      {String(selectedFood?._id) === String(food._id)
                        ? "Selected on map"
                        : "Tap card to focus"}
                    </span>
                    <span>{formatDateTime(food.pickupTime)}</span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Link
                      to={`/ngo/route/${food._id}`}
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center justify-center rounded-full border border-(--accent) px-4 py-2 text-sm font-semibold text-(--accent)"
                    >
                      Show route
                    </Link>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleClaim(food);
                      }}
                      type="button"
                      disabled={claimLoading}
                      className="sm:col-span-2 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white"
                    >
                      Claim food
                    </button>
                  </div>
                </div>
              ))}
              {!availableFoods.length && (
                <p className="text-sm text-(--muted)">
                  No nearby listings yet. Check that the restaurant and NGO
                  addresses are within range, then refresh.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NgoMap;
