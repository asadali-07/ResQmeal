import { useEffect } from "react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import {
  clearSelectedVolunteer,
  getVolunteerById,
} from "../store/volunteerSlice";
import { Truck } from 'lucide-react';

const VolunteerInfo = () => {
  const { volunteerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedVolunteer, loading, error } = useSelector(
    (state) => state.volunteerReducer
  );

  const { userInfo } = useSelector((state) => state.userReducer);

  const fallbackVolunteer = location.state?.volunteer || null;

  useEffect(() => {
    if (volunteerId) {
      dispatch(getVolunteerById(volunteerId));
    }

    return () => {
      dispatch(clearSelectedVolunteer());
    };
  }, [dispatch, volunteerId]);

  const volunteer = selectedVolunteer || fallbackVolunteer;

  const canMessageVolunteer =
    (userInfo?.role === "restaurant" ||
      userInfo?.role === "ngo") &&
    volunteer?.userId;

  const handleMessageVolunteer = () => {
    if (!canMessageVolunteer) {
      return;
    }

    navigate("/messages", {
      state: {
        recipientUserId:
          typeof volunteer.userId === "object"
            ? volunteer.userId._id
            : volunteer.userId,
        recipientName: volunteer.fullName || "Volunteer",
        recipientProfileImage: volunteer.profilePicture,
      },
    });
  };

  if (loading && !volunteer) {
    return (
      <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
        <p className="text-sm text-(--muted)">
          Loading volunteer information...
        </p>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
        <p className="text-sm text-(--muted)">
          {error || "Volunteer information is not available."}
        </p>

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
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--accent)">
            Volunteer Partner
          </p>

          <h2 className="mt-2 font-display text-3xl">
            {volunteer.userId.name || "Volunteer information"}
          </h2>

          <p className="mt-2 max-w-2xl text-sm text-(--muted)">
            Review volunteer details before assigning delivery tasks.
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
          className="rounded-full border border-(--accent-2) px-5 py-2 text-sm font-semibold text-(--accent-2)"
        >
          Back
        </button>
      </div>

      {error && fallbackVolunteer ? (
        <div className="glass-panel rounded-3xl border border-white/70 p-5 text-sm text-(--muted)">
          Showing volunteer details from fallback data because live fetch
          failed: {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel overflow-hidden rounded-3xl border border-white/70">
          {volunteer.userId.profileImage?.url ? (
            <img
              src={volunteer.userId.profileImage.url}
              alt={volunteer.userId.name}
              className="h-72 w-full object-cover"
            />
          ) : (
            <div className="grid h-72 place-items-center bg-[linear-gradient(135deg,rgba(255,122,26,0.18),rgba(35,155,86,0.16))]">
              <span className="font-display text-6xl text-(--accent)">
                {(volunteer.userId.name || "V")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            </div>
          )}

          <div className="p-6">
            <h3 className="font-display text-xl">
              {volunteer.userId.name || "Volunteer"}
            </h3>

            <div className="mt-4 flex items-center gap-3"> 
              <Truck className="h-5 w-5 text-(--muted)" />
              <span className="text-sm text-(--muted)">
                {volunteer.vehicleType || "Vehicle type not specified"}
              </span>
            </div>

            {(userInfo?.role === "restaurant" ||
              userInfo?.role === "ngo") && (
              <button
                type="button"
                onClick={handleMessageVolunteer}
                disabled={!canMessageVolunteer}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-(--accent-2) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <MessageCircle className="h-4 w-4" />
                Message Volunteer
              </button>
            )}

            {(userInfo?.role === "restaurant" ||
              userInfo?.role === "ngo") &&
            !volunteer?.userId ? (
              <p className="mt-3 text-xs text-(--muted)">
                Messaging will appear once this volunteer includes its owner
                account ID.
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">
              Volunteer details
            </h3>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span className="text-(--muted)">
                  Availability
                </span>

                <span className="font-semibold text-(--ink)">
                  {volunteer.isAvailable ? "Available for deliveries" : "Currently unavailable"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span className="text-(--muted)">
                  Phone Number
                </span>

                <span className="font-semibold text-(--ink)">
                  {volunteer.userId.phone || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span className="text-(--muted)">
                  Email
                </span>

                <span className="font-semibold text-(--ink)">
                  {volunteer.userId.email || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                <span className="text-(--muted)">
                  Total Deliveries
                </span>

                <span className="font-semibold text-(--ink)">
                  {volunteer.totalDeliveries || "0"}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl border border-white/70 p-6">
            <h3 className="font-display text-xl">
              Live Location
            </h3>

            <p className="mt-4 rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-sm leading-6 text-(--muted)">
              {volunteer.currentLocation.coordinates ? (
                <>
                  Latitude: {volunteer.currentLocation.coordinates[1].toFixed(4)} <br />
                  Longitude: {volunteer.currentLocation.coordinates[0].toFixed(4)}
                </>
              ) : (
                "Location data is not available for this volunteer."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerInfo;