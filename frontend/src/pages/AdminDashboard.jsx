import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  HeartHandshake,
  UtensilsCrossed,
  Users,
  Trash2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import {
  getAllNgos,
  getAllRestaurants,
  getAllVolunteers,
  getAvailableVolunteers,
  deleteNgo,
  deleteRestaurant,
  deleteVolunteer,
} from "../store/adminSlice";

const AdminDashboard = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("ngos");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const { userInfo, isAuthenticated } = useSelector(
    (state) => state.userReducer,
  );

  const {
    ngos = [],
    restaurants = [],
    volunteers = [],
    availableVolunteers = [],
    loading,
    error,
  } = useSelector((state) => state.adminReducer);

  useEffect(() => {
    dispatch(getAllNgos());
    dispatch(getAllRestaurants());
    dispatch(getAllVolunteers());
    dispatch(getAvailableVolunteers());
  }, [dispatch]);

  const tabs = [
    {
      key: "ngos",
      label: "NGOs",
      icon: HeartHandshake,
    },
    {
      key: "restaurants",
      label: "Restaurants",
      icon: UtensilsCrossed,
    },
    {
      key: "volunteers",
      label: "Volunteers",
      icon: Users,
    },
  ];

  const stats = useMemo(() => {
    return [
      {
        title: "NGOs",
        value: ngos.length,
        icon: HeartHandshake,
      },
      {
        title: "Restaurants",
        value: restaurants.length,
        icon: UtensilsCrossed,
      },
      {
        title: "Volunteers",
        value: volunteers.length,
        icon: Users,
      },
      {
        title: "Available",
        value: availableVolunteers.length,
        icon: ShieldCheck,
      },
    ];
  }, [ngos, restaurants, volunteers, availableVolunteers]);

  if (!isAuthenticated || userInfo?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl shadow-sm text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p>You are not authorized as an admin.</p>
        </div>
      </div>
    );
  }

  const handleDeleteNgo = (ngoId) => {
    if (!window.confirm("Delete this NGO?")) return;

    dispatch(deleteNgo(ngoId));
  };

  const handleDeleteRestaurant = (restaurantId) => {
    if (!window.confirm("Delete this restaurant?")) return;

    dispatch(deleteRestaurant(restaurantId));
  };

  const handleDeleteVolunteer = (volunteerId) => {
    if (!window.confirm("Delete this volunteer?")) return;

    dispatch(deleteVolunteer(volunteerId));
  };

  const renderNgos = () => {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ngos.map((ngo) => (
          <Link to={`/ngo-info/${ngo.userId}`} key={ngo._id}>
            <div className="glass-panel rounded-3xl border border-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-(--accent)/10 p-3 text-(--accent)">
                    <HeartHandshake className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-display text-2xl text-(--ink)">
                      {ngo.ngoName}
                    </h3>

                    <p className="text-sm text-(--muted)">NGO Partner</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteNgo(ngo.userId)}
                  className="rounded-full border border-red-300 p-2 text-red-500 transition-all hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <img
                src={
                  ngo.ngoPicture?.url ||
                  ngo.ngoPicture?.thumbnail ||
                  "https://placehold.co/600x400"
                }
                alt={ngo.ngoName}
                className="mt-4 h-52 w-full rounded-3xl object-cover"
              />

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/70 px-4 py-3">
                  <p className="text-xs text-(--muted)">Description</p>

                  <p className="mt-1 text-sm text-(--ink)">
                    {ngo.ngoDescription || "No description available"}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-(--muted)">Meals Received</span>

                  <span className="text-xl font-bold text-(--accent)">
                    {ngo.totalMealsReceived}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-(--muted)">Capacity</span>

                  <span className="text-xl font-bold text-(--accent-2)">
                    {ngo.capacity || 0}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-(--muted)">
                    <MapPin className="h-4 w-4" />

                    <span className="text-sm">
                      {ngo.address?.formattedAddress || "No address provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderRestaurants = () => {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Link to={`/restaurant-info/${restaurant._id}`} key={restaurant._id}>
            <div className="glass-panel rounded-3xl border border-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-(--accent)/10 p-3 text-(--accent)">
                    <UtensilsCrossed className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="font-display text-2xl text-(--ink)">
                      {restaurant.restaurantName}
                    </h3>

                    <p className="text-sm text-(--muted)">Restaurant Partner</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteRestaurant(restaurant.userId)}
                  className="rounded-full border border-red-300 p-2 text-red-500 transition-all hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <img
                src={
                  restaurant.restaurantPicture?.url ||
                  restaurant.restaurantPicture?.thumbnail ||
                  "https://placehold.co/600x400"
                }
                alt={restaurant.restaurantName}
                className="mt-4 h-52 w-full rounded-3xl object-cover"
              />

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/70 px-4 py-3">
                  <p className="text-xs text-(--muted)">Description</p>

                  <p className="mt-1 text-sm text-(--ink)">
                    {restaurant.restaurantDescription ||
                      "No description available"}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <span className="text-sm text-(--muted)">
                    Total Donations
                  </span>

                  <span className="text-xl font-bold text-(--accent)">
                    {restaurant.totalDonations}
                  </span>
                </div>

                <div className="rounded-2xl bg-white/70 px-4 py-3">
                  <div className="flex items-center gap-2 text-(--muted)">
                    <MapPin className="h-4 w-4" />

                    <span className="text-sm">
                      {restaurant.address?.formattedAddress ||
                        "No address provided"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-center">
                    <p className="text-xs text-(--muted)">Opens</p>

                    <p className="mt-1 font-semibold text-(--ink)">
                      {restaurant.openingTime || "--"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-center">
                    <p className="text-xs text-(--muted)">Closes</p>

                    <p className="mt-1 font-semibold text-(--ink)">
                      {restaurant.closingTime || "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderVolunteers = () => {
    return (
      <>
        <div className="mb-5 flex items-center justify-between rounded-2xl bg-white/70 px-5 py-4">
          <div>
            <h3 className="font-semibold text-(--ink)">
              Available Volunteers Only
            </h3>

            <p className="text-sm text-(--muted)">
              Toggle to show only available volunteers
            </p>
          </div>

          <button
            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
            className={`relative h-7 w-14 rounded-full transition-all duration-300 ${
              showAvailableOnly ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all duration-300 ${
                showAvailableOnly ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {(showAvailableOnly
            ? volunteers.filter((v) => v.isAvailable)
            : volunteers
          ).map((volunteer) => (
            <Link
              to={`/volunteer-info/${volunteer.userId?._id}`}
              key={volunteer._id}
            >
              <div className="glass-panel rounded-3xl border border-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${
                      volunteer.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {volunteer.isAvailable ? "Available" : "Busy"}
                  </div>

                  <button
                    onClick={() => handleDeleteVolunteer(volunteer.userId?._id)}
                    className="rounded-full border border-red-300 p-2 text-red-500 transition-all hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex flex-col items-center text-center">
                  <img
                    src={
                      volunteer.userId?.profileImage?.url ||
                      "https://ui-avatars.com/api/?name=Volunteer"
                    }
                    alt={volunteer.userId?.name}
                    className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                  />

                  <h3 className="mt-4 font-display text-2xl text-(--ink)">
                    {volunteer.userId?.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-2 text-sm text-(--muted)">
                    <Mail className="h-4 w-4" />
                    {volunteer.userId?.email}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-(--muted)">
                    <Phone className="h-4 w-4" />
                    {volunteer.userId?.phone}
                  </div>

                  <div className="mt-5 w-full flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                    <span className="text-sm text-(--muted)">Deliveries</span>

                    <span className="text-2xl font-bold text-(--accent-2)">
                      {volunteer.totalDeliveries}
                    </span>
                  </div>

                  <div className="mt-3 w-full flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                    <span className="text-sm text-(--muted)">Vehicle</span>

                    <span className="font-semibold uppercase text-(--ink)">
                      {volunteer.vehicleType}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="glass-panel rounded-4xl border border-white/70 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-(--accent)/10 px-4 py-2 text-sm font-semibold text-(--accent)">
              <ShieldCheck className="h-4 w-4" />
              Platform Administration
            </div>

            <h1 className="mt-4 font-display text-5xl leading-tight text-(--ink)">
              ResQMeal Admin Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-base text-(--muted)">
              Manage NGOs, restaurants, volunteers and monitor community impact
              across the platform.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-3xl border border-white/70 bg-white/70 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-(--muted)">{stat.title}</p>

                    <h2 className="mt-2 text-4xl text-(--ink)">
                      {stat.value}
                    </h2>
                  </div>

                  <div className="rounded-2xl bg-(--accent)/10 p-3 text-(--accent)">
                    <Icon className="h-7 w-7" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* TABS */}
        <div className="mt-8 flex flex-wrap gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-(--accent) text-white shadow-lg"
                    : "border border-white/70 bg-white/80 text-(--ink)"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-red-600">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="glass-panel rounded-3xl border border-white/70 p-10 text-center">
          <p className="text-lg font-semibold text-(--ink)">
            Loading dashboard...
          </p>
        </div>
      )}

      {/* CONTENT */}
      {!loading && (
        <div>
          {activeTab === "ngos" && renderNgos()}
          {activeTab === "restaurants" && renderRestaurants()}
          {activeTab === "volunteers" && renderVolunteers()}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
