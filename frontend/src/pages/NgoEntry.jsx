import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import NgoMap from "./NgoMap";
import NgoProfileSetup from "./NgoProfileSetup";
import { getUserInfo } from "../store/userSlice";
import { getUserNgo } from "../store/ngoSlice";

const NgoEntry = () => {
    const dispatch = useDispatch();
    const { userInfo, loading: userLoading } = useSelector((state) => state.userReducer);
    const { ngo, loading } = useSelector((state) => state.ngoReducer);

    useEffect(() => {
        if (!userInfo) {
            dispatch(getUserInfo());
        }
    }, [dispatch, userInfo]);

    useEffect(() => {
        if (userInfo?.role === "ngo") {
            dispatch(getUserNgo());
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
                <p className="text-sm text-[var(--muted)]">Please login to access the NGO map.</p>
                <NavLink
                    to="/login"
                    className="mt-4 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                >
                    Go to login
                </NavLink>
            </div>
        );
    }

    if (userInfo.role !== "ngo") {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                    This space is reserved for NGO partners.
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

    if (!ngo && loading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/70 p-8 text-center">
                <p className="text-sm text-[var(--muted)]">Loading NGO profile...</p>
            </div>
        );
    }

    return ngo ? <NgoMap /> : <NgoProfileSetup />;
};

export default NgoEntry;
