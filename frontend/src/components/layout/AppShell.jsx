import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  MapPinned,
  HandHeart,
  Truck,
  MessageSquare,
  LogIn,
  UserPlus,
  Package,
  Bell,
  UserCircle,
  Trophy,
} from "lucide-react";
import { ToastContainer } from "react-toastify";
import { getUserInfo, logoutUser } from "../../store/userSlice";
import { clearNotifications } from "../../store/notificationSlice";
import "react-toastify/dist/ReactToastify.css";

const AppShell = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector(
    (state) => state.userReducer,
  );
  const { items: notifications } = useSelector(
    (state) => state.notificationReducer || { items: [] },
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearNotifications = () => {
    dispatch(clearNotifications());
    setShowClearModal(false);
  };

  useEffect(() => {
    if (!isAuthenticated && !userInfo) {
      dispatch(getUserInfo());
    }
  }, [dispatch, isAuthenticated, userInfo]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  const role = userInfo?.role;
  const navItems = [{ to: "/", label: "Home", icon: MapPinned },{ to: "/leaderboard", label: "Leaderboard", icon: Trophy }];

  if (isAuthenticated) {
    if (role === "restaurant") {
      navItems.push({ to: "/restaurant/food", label: "Food", icon: Package });
      navItems.push({ to: "/restaurant/claims", label: "Claims", icon: Bell });
    }
    if (role === "ngo") {
      navItems.push({ to: "/ngo", label: "NGO Map", icon: HandHeart });
      navItems.push({ to: "/ngo/claims", label: "Claims", icon: Package });
    }
    if (role === "volunteer") {
      navItems.push({ to: "/volunteer", label: "Volunteer", icon: Truck });
    }
    navItems.push({ to: "/messages", label: "Messages", icon: MessageSquare });
    navItems.push({ to: "/account", label: "Account", icon: UserCircle });
  }

  return (
    <>
      {showClearModal && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-(--ink)">
              Clear notifications?
            </h3>

            <p className="mt-3 text-sm leading-6 text-(--muted)">
              Clearing notifications will remove all claim tracking and you will
              no longer be able to generate pickup or delivery QR codes.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleClearNotifications();
                  setShowClearModal(false);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} />
        <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur">
          <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-4 px-4 py-4 md:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-(--accent) text-white shadow-lg shadow-orange-200">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-xl">ResQmeal</p>
                <p className="text-xs text-(--muted)">
                  Local surplus to shared meals
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap items-center gap-2 text-sm">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-full px-4 py-2 transition ${
                        isActive
                          ? "bg-(--accent-2) text-white"
                          : "bg-white/70 text-(--ink) hover:bg-white"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications((value) => !value)}
                      className="relative grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/80 text-(--ink)"
                      title="Notifications"
                    >
                      <Bell className="h-4 w-4" />
                      {notifications.length ? (
                        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-(--accent) px-1 text-[10px] font-semibold text-white">
                          {notifications.length}
                        </span>
                      ) : null}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 top-12 z-50 w-80 rounded-3xl border border-white/80 bg-white p-4 shadow-2xl">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-display text-lg">Notifications</p>
                          <button
                            onClick={() => {
                              if (
                                userInfo?.role === "restaurant" ||
                                userInfo?.role === "ngo"
                              ) {
                                setShowClearModal(true);
                                setShowNotifications(false);
                              } else {
                                dispatch(clearNotifications());
                                setShowNotifications(false);
                              }
                            }}
                            className="text-xs font-semibold text-(--accent)"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="mt-3 max-h-80 space-y-2 overflow-auto">
                          {notifications.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3 text-sm"
                            >
                              <p className="font-semibold text-(--ink)">
                                {item.title ||
                                  item.message ||
                                  item.type ||
                                  "Update"}
                              </p>
                              <p className="mt-1 text-xs text-(--muted)">
                                {item.message || item.type || "notification"}
                              </p>
                            </div>
                          ))}
                          {!notifications.length && (
                            <p className="text-sm text-(--muted)">
                              No notifications yet.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {userInfo?.name || "Member"}
                    </p>
                    <p className="text-xs uppercase text-(--muted)">
                      {userInfo?.role || "role"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-full border border-(--accent) px-4 py-2 text-sm font-semibold text-(--accent) hover:bg-(--accent) hover:text-white"
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink
                    to="/login"
                    className="flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-sm font-semibold text-(--ink)"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="flex items-center gap-2 rounded-full bg-(--accent) px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200"
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
      </div>
    </>
  );
};

export default AppShell;
