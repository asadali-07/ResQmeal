import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import { clearError, resetPassword } from "../store/userSlice";

const SetNewPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const [passwordReset, setPasswordReset] = useState(false);

  const { loading, error } = useSelector(
    (state) => state.userReducer
  );

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    dispatch(clearError());

    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (values) => {
    if (!values.password || !values.confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const result = await dispatch(
      resetPassword({
        token,
        password: values.password,
      })
    );

    if (result?.meta?.requestStatus === "fulfilled") {
      setPasswordReset(true);
      reset();

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass-panel rounded-3xl border border-white/70 p-8">
        <h2 className="font-display text-3xl">
          Set New Password
        </h2>

        <p className="mt-2 text-sm text-(--muted)">
          Create a strong password for your account.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="text-sm font-semibold">
              New Password
            </label>

            <input
              type="password"
              disabled={passwordReset}
              {...register("password")}
              placeholder="Enter new password"
              className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 disabled:opacity-60"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">
              Confirm Password
            </label>

            <input
              type="password"
              disabled={passwordReset}
              {...register("confirmPassword")}
              placeholder="Confirm new password"
              className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 disabled:opacity-60"
            />
          </div>

          {passwordReset && (
            <p className="rounded-2xl bg-green-50 p-4 text-sm text-green-600">
              Password updated successfully. Redirecting to login...
            </p>
          )}

          {error && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || passwordReset}
            className="w-full rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : passwordReset
                ? "Password Updated"
                : "Update Password"}
          </button>
        </form>

        <p className="mt-5 text-sm text-(--muted)">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-(--accent-2)"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SetNewPassword;