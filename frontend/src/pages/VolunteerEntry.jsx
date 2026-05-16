import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import VolunteerDashboard from "./VolunteerDashboard";
import VolunteerProfileSetup from "./VolunteerProfileSetup";
import { getUserInfo } from "../store/userSlice";
import { getUserVolunteer } from "../store/volunteerSlice";

const VolunteerEntry = () => {
    const dispatch = useDispatch();
    const { userInfo, loading: userLoading } = useSelector((state) => state.userReducer);
    const { volunteer, loading } = useSelector((state) => state.volunteerReducer);

    useEffect(() => {
        if (!userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "volunteer") {
            dispatch(getUserVolunteer());
        }
    }, [dispatch, userInfo]);

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
                <p className="text-sm text-[var(--muted)]">
                    Please login to access the volunteer dashboard.
                </p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    if (userInfo.role !== "volunteer") {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                    This space is reserved for volunteers.
                </p>
                <NavLink
                    to="/"
                    className="mt-4 inline-flex rounded-full border border-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent)]"
                >
                    Back to home
                </NavLink>
            </div>
        );
    }

    if (!volunteer && loading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Loading volunteer profile...</p>
            </div>
        );
    }

    return volunteer ? <VolunteerDashboard /> : <VolunteerProfileSetup />;
};

export default VolunteerEntry;
