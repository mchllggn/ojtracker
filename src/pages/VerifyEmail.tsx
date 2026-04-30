import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resendVerification, verifyEmail } from "../apis";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/Layout";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login: setLoggedInUser } = useAuth();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const queryEmail = searchParams.get("email") ?? "";
    if (queryEmail) {
      setEmail(queryEmail);
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setResendCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resendCooldown]);

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    const response = await verifyEmail({ email, otp });

    setIsSubmitting(false);

    if (response.success && response.user && response.token) {
      setLoggedInUser(response.user, response.token);
      navigate("/home");
      return;
    }

    if (response.resendAvailableInSeconds !== undefined) {
      setResendCooldown(response.resendAvailableInSeconds);
    }

    setErrorMessage(response.message || "Unable to verify your account.");
  };

  const handleResend = async () => {
    setMessage("");
    setErrorMessage("");
    setIsResending(true);

    const response = await resendVerification({ email });

    setIsResending(false);

    if (response.success) {
      setResendCooldown(response.resendAvailableInSeconds ?? 60);
      setMessage(response.message || "A new code has been sent.");
      return;
    }

    if (response.resendAvailableInSeconds !== undefined) {
      setResendCooldown(response.resendAvailableInSeconds);
    }

    setErrorMessage(response.message || "Unable to resend the code.");
  };

  return (
    <Layout>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-lg items-center px-4 py-12">
        <div className="w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="space-y-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Email Verification
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Enter the code sent to your inbox
            </h1>
            <p className="text-sm text-gray-600">
              We sent a one-time code to {email || "your email address"}. Use it
              below to verify your account.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleVerify}>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <TextInput
                id="verify-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="otp"
              >
                Verification Code
              </label>
              <TextInput
                id="verify-otp"
                name="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            {message && (
              <p className="text-sm text-green-600" role="status">
                {message}
              </p>
            )}

            <PrimaryButton type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify Account"}
            </PrimaryButton>
          </form>

          <div className="mt-5 flex flex-col items-center gap-3 text-sm text-gray-600">
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline disabled:cursor-not-allowed disabled:text-blue-300"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0 || !email}
            >
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend available in ${resendCooldown}s`
                  : "Resend verification code"}
            </button>
            <button
              type="button"
              className="font-medium text-gray-700 hover:underline"
              onClick={() => navigate("/")}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmail;
