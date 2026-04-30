import { type MouseEvent, useEffect, useState } from "react";
import { type User } from "../apis";
import { useIndexAuthForms } from "../hooks/useIndexAuthForms";
import Modal from "./Modal";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";

type AuthMode = "login" | "register";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  onVerificationRequired: (email: string) => void;
}

const AuthModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onVerificationRequired,
}: AuthModalProps) => {
  const [mode, setMode] = useState<AuthMode>("login");

  const {
    loginData,
    loginError,
    loginFieldErrors,
    registerData,
    registerError,
    registerFieldErrors,
    updateLoginData,
    updateRegisterData,
    clearLoginErrors,
    clearRegisterErrors,
    handleLogin,
    handleRegister,
  } = useIndexAuthForms();

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      clearLoginErrors();
      clearRegisterErrors();
    }
  }, [isOpen, clearLoginErrors, clearRegisterErrors]);

  const switchMode = (nextMode: AuthMode) => {
    clearLoginErrors();
    clearRegisterErrors();
    setMode(nextMode);
  };

  const handleClose = () => {
    clearLoginErrors();
    clearRegisterErrors();
    onClose();
  };

  const handleModeLinkClick = (e: MouseEvent, nextMode: AuthMode) => {
    e.preventDefault();
    switchMode(nextMode);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {mode === "login" ? (
        <>
          <form
            className="space-y-6"
            onSubmit={(e) =>
              handleLogin(e, onLoginSuccess, onVerificationRequired)
            }
          >
            <div className="space-y-6">
              {loginError && (
                <p className="text-sm text-red-600" role="alert">
                  {loginError}
                </p>
              )}
              {loginFieldErrors?.email && (
                <p className="text-sm text-red-600" role="alert">
                  {loginFieldErrors.email}
                </p>
              )}
              <TextInput
                id="login-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={loginData.email}
                onChange={(e) =>
                  updateLoginData({ ...loginData, email: e.target.value })
                }
                required
                autoComplete="email"
              />
              {loginFieldErrors?.password && (
                <p className="text-sm text-red-600" role="alert">
                  {loginFieldErrors.password}
                </p>
              )}
              <TextInput
                id="login-password"
                name="password"
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) =>
                  updateLoginData({ ...loginData, password: e.target.value })
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
              onClick={(e) => handleModeLinkClick(e, "register")}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign Up
            </a>
          </div>
        </>
      ) : (
        <>
          <form
            className="space-y-6"
            onSubmit={(e) => handleRegister(e, onVerificationRequired)}
          >
            <div className="space-y-4">
              {registerError && (
                <p className="text-sm text-red-600" role="alert">
                  {registerError}
                </p>
              )}
              {registerFieldErrors?.name && (
                <p className="text-sm text-red-600" role="alert">
                  {registerFieldErrors.name}
                </p>
              )}
              <TextInput
                id="register-name"
                name="name"
                type="text"
                placeholder="Full name"
                value={registerData.name}
                onChange={(e) =>
                  updateRegisterData({ ...registerData, name: e.target.value })
                }
                required
                autoComplete="name"
              />
              {registerFieldErrors?.email && (
                <p className="text-sm text-red-600" role="alert">
                  {registerFieldErrors.email}
                </p>
              )}
              <TextInput
                id="register-email"
                name="email"
                type="email"
                placeholder="Email address"
                value={registerData.email}
                onChange={(e) =>
                  updateRegisterData({ ...registerData, email: e.target.value })
                }
                required
                autoComplete="email"
              />
              {registerFieldErrors?.password && (
                <p className="text-sm text-red-600" role="alert">
                  {registerFieldErrors.password}
                </p>
              )}
              <TextInput
                id="register-password"
                name="password"
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={(e) =>
                  updateRegisterData({
                    ...registerData,
                    password: e.target.value,
                  })
                }
                required
                autoComplete="new-password"
              />
              {registerFieldErrors?.confirmPassword && (
                <p className="text-sm text-red-600" role="alert">
                  {registerFieldErrors.confirmPassword}
                </p>
              )}
              <TextInput
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={registerData.confirmPassword}
                onChange={(e) =>
                  updateRegisterData({
                    ...registerData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                autoComplete="new-password"
              />
            </div>
            <PrimaryButton type="submit" fullWidth>
              Create account
            </PrimaryButton>
          </form>

          <div className="flex gap-1 mt-6 justify-center text-sm">
            <span>Already have an account?</span>
            <a
              href="#"
              onClick={(e) => handleModeLinkClick(e, "login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Sign In
            </a>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AuthModal;
