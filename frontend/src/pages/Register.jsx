import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { registerUser } from "../store/userSlice";

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.userReducer);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            role: "restaurant",
        },
    });

    const onSubmit = async (values) => {
        const result = await dispatch(registerUser(values));
        if (result?.meta?.requestStatus === "fulfilled") {
            navigate("/");
        }
    };

    const { isAuthenticated, userInfo } = useSelector((state) => state.userReducer);

    useEffect(() => {
        if (isAuthenticated && userInfo?.role) {
            const rolePath = userInfo.role === "restaurant"
                ? "/restaurant"
                : userInfo.role === "ngo"
                  ? "/ngo"
                  : "/volunteer";
            navigate(rolePath, { replace: true });
        }
    }, [isAuthenticated, userInfo, navigate]);

    return (
        <div className="mx-auto max-w-xl">
            <div className="glass-panel rounded-3xl border border-white/70 p-8">
                <h2 className="font-display text-3xl">Create your account</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                    Join ResQmeal as a partner in the rescue network.
                </p>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-semibold">Name</label>
                            <input
                                type="text"
                                {...register("name", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Phone</label>
                            <input
                                type="text"
                                {...register("phone", { required: true })}
                                className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Email</label>
                        <input
                            type="email"
                            {...register("email", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Password</label>
                        <input
                            type="password"
                            {...register("password", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold">Role</label>
                        <select
                            {...register("role", { required: true })}
                            className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                        >
                            <option value="restaurant">Restaurant</option>
                            <option value="ngo">NGO</option>
                            <option value="volunteer">Volunteer</option>
                        </select>
                    </div>
                    {error && error !== "Failed to fetch user info" && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create account"}
                    </button>
                </form>
                <p className="mt-5 text-sm text-[var(--muted)]">
                    Already registered?{" "}
                    <NavLink to="/login" className="font-semibold text-[var(--accent-2)]">
                        Login here
                    </NavLink>
                </p>
            </div>
        </div>
    );
};

export default Register;
