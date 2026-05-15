import { type FormEvent, useState } from "react";
import { login, type LoginFieldErrors, type User } from "../apis";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";
import { Loader, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (user: User, token: string) => void;
  onVerificationRequired: (email: string) => void;
  onSwitchToRegister: () => void;
}

const LoginForm = ({
  onLoginSuccess,
  onVerificationRequired,
  onSwitchToRegister,
}: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await login({ email, password });

      if (response.success && response.user && response.token) {
        onLoginSuccess(response.user, response.token);
        return;
      }

      if (response.verificationRequired && response.email) {
        onVerificationRequired(response.email);
        return;
      }

      const errors = (response.fieldErrors ?? {}) as LoginFieldErrors;
      setFieldErrors(errors);
      if (!errors.email && !errors.password) {
        setError(response.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div
            className="rounded-lg bg-red-50 p-4 border border-red-200"
            role="alert"
          >
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>
          {fieldErrors?.email && (
            <p className="text-xs text-red-600 font-medium">
              {fieldErrors.email}
            </p>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <TextInput
              id="login-email"
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="pl-6"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          {fieldErrors?.password && (
            <p className="text-xs text-red-600 font-medium">
              {fieldErrors.password}
            </p>
          )}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-black pointer-events-none" />
            <TextInput
              id="login-password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pl-6"
            />
          </div>
        </div>

        <PrimaryButton type="submit" fullWidth disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </PrimaryButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">
            Don't have an account?
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          onSwitchToRegister();
        }}
        className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
      >
        Create a new account
      </button>
    </>
  );
};

export default LoginForm;
