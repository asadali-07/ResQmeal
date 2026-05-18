import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy, UtensilsCrossed, HeartHandshake, Users } from "lucide-react";

import { getTopRestaurants } from "../store/restaurantSlice";
import { getTopNgos } from "../store/ngoSlice";
import { getTopVolunteers } from "../store/volunteerSlice";

const LeaderBoard = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("restaurants");

  const { topRestaurants = [] } = useSelector(
    (state) => state.restaurantReducer,
  );

  const { topNgos = [] } = useSelector((state) => state.ngoReducer);

  const { topVolunteers = [] } = useSelector(
    (state) => state.volunteerReducer,
  );

  useEffect(() => {
    dispatch(getTopRestaurants());
    dispatch(getTopNgos());
    dispatch(getTopVolunteers());
  }, [dispatch]);

  const tabs = [
    {
      key: "restaurants",
      label: "Restaurants",
      icon: UtensilsCrossed,
    },
    {
      key: "ngos",
      label: "NGOs",
      icon: HeartHandshake,
    },
    {
      key: "volunteers",
      label: "Volunteers",
      icon: Users,
    },
  ];

  const getRankStyle = (index) => {
    if (index === 0) {
      return "bg-yellow-400 text-black";
    }

    if (index === 1) {
      return "bg-gray-300 text-black";
    }

    if (index === 2) {
      return "bg-amber-700 text-white";
    }

    return "bg-white/80 text-(--ink)";
  };

  const renderRestaurants = () => {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {topRestaurants.map((restaurant, index) => (
          <div
            key={restaurant._id}
            className="glass-panel rounded-3xl border border-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${getRankStyle(index)}`}
              >
                #{index + 1}
              </div>

              <Trophy
                className={`h-6 w-6 ${
                  index === 0
                    ? "text-yellow-500"
                    : index === 1
                      ? "text-gray-400"
                      : index === 2
                        ? "text-amber-700"
                        : "text-(--muted)"
                }`}
              />
            </div>

            <img
              src={
                restaurant.restaurantPicture?.url ||
                restaurant.restaurantPicture?.thumbnail
              }
              alt={restaurant.restaurantName}
              className="mt-4 h-52 w-full rounded-3xl object-cover"
            />

            <div className="mt-5">
              <h3 className="font-display text-2xl text-(--ink)">
                {restaurant.restaurantName}
              </h3>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <span className="text-sm text-(--muted)">
                  Total Donations
                </span>

                <span className="text-xl font-bold text-(--accent)">
                  {restaurant.totalDonations}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNgos = () => {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {topNgos.map((ngo, index) => (
          <div
            key={ngo._id}
            className="glass-panel rounded-3xl border border-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${getRankStyle(index)}`}
              >
                #{index + 1}
              </div>

              <Trophy
                className={`h-6 w-6 ${
                  index === 0
                    ? "text-yellow-500"
                    : index === 1
                      ? "text-gray-400"
                      : index === 2
                        ? "text-amber-700"
                        : "text-(--muted)"
                }`}
              />
            </div>

            <img
              src={ngo.ngoPicture?.url || ngo.ngoPicture?.thumbnail}
              alt={ngo.ngoName}
              className="mt-4 h-52 w-full rounded-3xl object-cover"
            />

            <div className="mt-5">
              <h3 className="font-display text-2xl text-(--ink)">
                {ngo.ngoName}
              </h3>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <span className="text-sm text-(--muted)">
                  Meals Received
                </span>

                <span className="text-xl font-bold text-(--accent)">
                  {ngo.totalMealsReceived}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderVolunteers = () => {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {topVolunteers.map((volunteer, index) => (
          <div
            key={volunteer._id}
            className="glass-panel rounded-3xl border border-white/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${getRankStyle(index)}`}
              >
                #{index + 1}
              </div>

              <Trophy
                className={`h-6 w-6 ${
                  index === 0
                    ? "text-yellow-500"
                    : index === 1
                      ? "text-gray-400"
                      : index === 2
                        ? "text-amber-700"
                        : "text-(--muted)"
                }`}
              />
            </div>

            <div className="mt-5 flex flex-col items-center text-center">
              <img
                src={
                  volunteer.user?.profileImage?.url ||
                  "https://ui-avatars.com/api/?name=Volunteer"
                }
                alt={volunteer.user?.name}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
              />

              <h3 className="mt-4 font-display text-2xl text-(--ink)">
                {volunteer.user?.name}
              </h3>

              <div className="mt-4 w-full rounded-2xl bg-white/70 px-4 py-3">
                <p className="text-sm text-(--muted)">
                  Total Deliveries
                </p>

                <p className="mt-1 text-2xl font-bold text-(--accent-2)">
                  {volunteer.totalDeliveries}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* HERO */}
      <div className="glass-panel rounded-[2rem] border border-white/70 p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-(--accent)/10 px-4 py-2 text-sm font-semibold text-(--accent)">
              <Trophy className="h-4 w-4" />
              Community Impact Rankings
            </div>

            <h1 className="mt-4 font-display text-5xl leading-tight text-(--ink)">
              ResQMeal Leaderboard
            </h1>

            <p className="mt-3 max-w-2xl text-base text-(--muted)">
              Celebrating the restaurants, NGOs, and volunteers making the
              biggest impact in reducing food waste and helping communities.
            </p>
          </div>
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

      {/* CONTENT */}
      <div>
        {activeTab === "restaurants" && renderRestaurants()}
        {activeTab === "ngos" && renderNgos()}
        {activeTab === "volunteers" && renderVolunteers()}
      </div>
    </div>
  );
};

export default LeaderBoard;