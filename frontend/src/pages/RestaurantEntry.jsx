import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import RestaurantDashboard from "./RestaurantDashboard";
import { getUserInfo } from "../store/userSlice";
import { getUserRestaurant } from "../store/restaurantSlice";

const RestaurantEntry = () => {
    const dispatch = useDispatch();
    const { userInfo, loading: userLoading } = useSelector((state) => state.userReducer);
    const { restaurant, loading } = useSelector((state) => state.restaurantReducer);

    useEffect(() => {
        if (!userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "restaurant") {
            dispatch(getUserRestaurant());
        }
    }, [dispatch, userInfo]);

    if (!userInfo && userLoading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">Checking your account...</p>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">Please login to access the restaurant dashboard.</p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    if (userInfo.role !== "restaurant") {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">
                    This space is reserved for restaurant partners.
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

    if (!restaurant && loading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-(--muted)">Loading restaurant profile...</p>
            </div>
        );
    }

    return <RestaurantDashboard />;
};

export default RestaurantEntry;
