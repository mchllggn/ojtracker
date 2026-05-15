import { useState } from "react";
import { type User } from "../apis";
import { Dialog, DialogContent } from "./ui/dialog";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setMode("login");
      onClose();
    }
  };

  const switchToRegister = () => setMode("register");
  const switchToLogin = () => setMode("login");

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-md p-8 sm:max-w-md">
        {mode === "login" ? (
          <LoginForm
            onLoginSuccess={onLoginSuccess}
            onVerificationRequired={onVerificationRequired}
            onSwitchToRegister={switchToRegister}
          />
        ) : (
          <RegisterForm
            onVerificationRequired={onVerificationRequired}
            onSwitchToLogin={switchToLogin}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
