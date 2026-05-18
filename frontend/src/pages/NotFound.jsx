import { NavLink } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="mx-auto max-w-xl text-center">
            <div className="glass-panel rounded-3xl border border-white/70 p-10">
                <h2 className="font-display text-4xl">Page not found</h2>
                <p className="mt-3 text-sm text-(--muted)">
                    The route you tried does not exist. Head back to the live map.
                </p>
                <NavLink
                    to="/"
                    className="mt-6 inline-flex rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white"
                >
                    Back to home
                </NavLink>
            </div>
        </div>
    );
};

export default NotFound;
