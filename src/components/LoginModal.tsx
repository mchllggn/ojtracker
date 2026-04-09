import { type FormEvent, useState } from "react";
import { login, type LoginFieldErrors, type User } from "../services/api";
import Modal from "./Modal";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";

interface LoginModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  onLoginSuccess: (user: User, token: string) => void;
  setShowRegisterModal: (show: boolean) => void;
}

const LoginModal = ({
  showModal,
  setShowModal,
  onLoginSuccess,
  setShowRegisterModal,
}: LoginModalProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});

  const clearErrors = () => {
    setErrorMessage("");
    setFieldErrors({});
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearErrors();

    const response = await login({
      email: loginData.email,
      password: loginData.password,
    });

    if (response.success && response.user && response.token) {
      onLoginSuccess(response.user, response.token);
      return;
    }

    const nextFieldErrors = (response.fieldErrors ?? {}) as LoginFieldErrors;
    setFieldErrors(nextFieldErrors);
    if (!nextFieldErrors.email && !nextFieldErrors.password) {
      setErrorMessage(response.message || "Login failed. Please try again.");
    }
  };

  return (
    <Modal
      isOpen={showModal}
      onClose={() => {
        clearErrors();
        setShowModal(false);
      }}
    >
      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-6">
          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
          {fieldErrors?.email && (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
          <TextInput
            id="login-email"
            name="email"
            type="email"
            placeholder="Email address"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            required
            autoComplete="email"
          />
          {fieldErrors?.password && (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.password}
            </p>
          )}
          <TextInput
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            required
            autoComplete="current-password"
          />
        </div>
        <PrimaryButton type="submit" fullWidth>
          Sign In
        </PrimaryButton>
      </form>

      <div className="flex gap-1 mt-6 justify-center text-sm">
        <span>Don't have a Account?</span>
        <a
          href="#"
          onClick={() => {
            clearErrors();
            setShowRegisterModal(true);
          }}
          className="text-blue-600 font-medium hover:underline"
        >
          Sign Up
        </a>
      </div>
    </Modal>
  );
};

export default LoginModal;
