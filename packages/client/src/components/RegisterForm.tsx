import { type FormEvent, useState } from "react";
import { register, type RegisterFieldErrors } from "../apis";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";
import { Loader, Mail, Lock, User as UserIcon } from "lucide-react";

interface RegisterFormProps {
  onVerificationRequired: (email: string) => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({
  onVerificationRequired,
  onSwitchToLogin,
}: RegisterFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const response = await register({
        name,
        email,
        password,
        confirmPassword,
      });

      if (response.success) {
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        onVerificationRequired(response.email ?? email);
        return;
      }

      const errors = (response.fieldErrors ?? {}) as RegisterFieldErrors;
      setFieldErrors(errors);
      if (
        !errors.name &&
        !errors.email &&
        !errors.password &&
        !errors.confirmPassword
      ) {
        setError(response.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
        <p className="text-sm text-gray-600">Join us to get started</p>
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
            htmlFor="register-name"
            className="block text-sm font-medium text-gray-700"
          >
            Full name
          </label>
          {fieldErrors?.name && (
            <p className="text-xs text-red-600 font-medium">
              {fieldErrors.name}
            </p>
          )}
          <div className="relative">
            <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <TextInput
              id="register-name"
              name="name"
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="pl-6"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="register-email"
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
              id="register-email"
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
            htmlFor="register-password"
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
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <TextInput
              id="register-password"
              name="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="pl-6"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label
            htmlFor="register-confirm-password"
            className="block text-sm font-medium text-gray-700"
          >
            Confirm password
          </label>
          {fieldErrors?.confirmPassword && (
            <p className="text-xs text-red-600 font-medium">
              {fieldErrors.confirmPassword}
            </p>
          )}
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
            <TextInput
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="pl-6"
            />
          </div>
        </div>

        <PrimaryButton type="submit" fullWidth disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create account"
          )}
        </PrimaryButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">
            Already have an account?
          </span>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          onSwitchToLogin();
        }}
        className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
      >
        Sign in instead
      </button>
    </>
  );
};

export default RegisterForm;
