import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../store/userSlice";
import { useForm } from "react-hook-form";

const ForgetPassword = () => {
  const dispatch = useDispatch();
  const [emailSent, setEmailSent] = useState(false);

  const { loading, error } = useSelector(
    (state) => state.userReducer
  );

  const { register, handleSubmit } = useForm();

  const onSubmit = async (values) => {
    const result = await dispatch(
      forgotPassword(values.email)
    );

    if (result?.meta?.requestStatus === "fulfilled") {
      setEmailSent(true);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="glass-panel rounded-3xl border border-white/70 p-8">
        <h2 className="font-display text-3xl">
          Forgot Password
        </h2>

        <p className="mt-2 text-sm text-(--muted)">
          Enter your registered email address and we'll
          send you a password reset link.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="text-sm font-semibold">
              Email
            </label>

            <input
              type="email"
              {...register("email")}
              disabled={emailSent}
              className="mt-2 w-full rounded-2xl border border-white/70 bg-white/80 px-4 py-3 disabled:opacity-60"
              placeholder="Enter your email"
            />
          </div>

          {emailSent && (
            <p className="rounded-2xl bg-green-50 p-4 text-sm text-green-600">
              If an account exists with that email address,
              a password reset link has been sent.
            </p>
          )}

          {error && (
            <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || emailSent}
            className="w-full rounded-full bg-(--accent) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 disabled:opacity-50"
          >
            {loading
              ? "Sending..."
              : emailSent
                ? "Email Sent"
                : "Send Reset Link"}
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

export default ForgetPassword;