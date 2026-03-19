import React from "react";
import Modal from "./Modal";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";
import type { LoginFieldErrors } from "../../backend/services/authTypes";

interface LoginModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  loginData: { email: string; password: string };
  setLoginData: (data: { email: string; password: string }) => void;
  errorMessage?: string;
  fieldErrors?: LoginFieldErrors;
  handleLogin: (e: React.FormEvent) => void;
  setShowRegisterModal: (show: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  showModal,
  setShowModal,
  loginData,
  setLoginData,
  errorMessage,
  fieldErrors,
  handleLogin,
  setShowRegisterModal,
}) => {
  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
      <form className="space-y-6" onSubmit={handleLogin}>
        <div className="space-y-4">
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
          onClick={() => setShowRegisterModal(true)}
          className="text-blue-600 font-medium hover:underline"
        >
          Sign Up
        </a>
      </div>
    </Modal>
  );
};

export default LoginModal;
