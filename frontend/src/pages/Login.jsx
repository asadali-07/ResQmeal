import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { loginUser } from "../store/userSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.userReducer);
  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    const result = await dispatch(loginUser(values));
    if (result?.meta?.requestStatus === "fulfilled") {
      navigate("/");
    }
  };

  const { isAuthenticated, userInfo } = useSelector(
    (state) => state.userReducer,
  );

  useEffect(() => {
    if (isAuthenticated && userInfo?.role) {
      const rolePath =
        userInfo.role === "restaurant"
          ? "/restaurant"
          : userInfo.role === "ngo"
            ? "/ngo"
            : "/volunteer";
      navigate(rolePath, { replace: true });
    }
  }, [isAuthenticated, userInfo, navigate]);

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass-panel rounded-3xl border border-white/70 p-8">
        <h2 className="font-display text-3xl">Welcome back</h2>
        <p className="mt-2 text-sm text-(--muted)">
          Login to access your rescue dashboard.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              {...register("email", { required: true })}
              className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Password</label>

              <NavLink
                to="/forgot-password"
                className="text-xs font-medium text-(--accent-2) hover:underline"
              >
                Forgot Password?
              </NavLink>
            </div>

            <input
              type="password"
              {...register("password", { required: true })}
              className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
            />
          </div>
          {error && error !== "Failed to fetch user info" && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-5 text-sm text-(--muted)">
          Need an account?{" "}
          <NavLink to="/register" className="font-semibold text-(--accent-2)">
            Register here
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default Login;
