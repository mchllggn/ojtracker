import { type FormEvent, useState } from "react";
import { register, type RegisterFieldErrors } from "../services/api";
import Modal from "./Modal";
import TextInput from "./TextInput";
import PrimaryButton from "./PrimaryButton";
interface RegisterModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  setShowLoginModal: (show: boolean) => void;
}

const RegisterModal = ({
  showModal,
  setShowModal,
  setShowLoginModal,
}: RegisterModalProps) => {
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  const clearErrors = () => {
    setErrorMessage("");
    setFieldErrors({});
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    const response = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
    });

    if (response.success) {
      alert("Registration successful! Please login.");
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      clearErrors();
      setShowModal(false);
      setShowLoginModal(true);
      return;
    }

    const nextFieldErrors = (response.fieldErrors ?? {}) as RegisterFieldErrors;
    setFieldErrors(nextFieldErrors);

    if (
      !nextFieldErrors.name &&
      !nextFieldErrors.email &&
      !nextFieldErrors.password &&
      !nextFieldErrors.confirmPassword
    ) {
      setErrorMessage(
        response.message || "Registration failed. Please try again.",
      );
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
      <form className="space-y-6" onSubmit={handleRegister}>
        <div className="space-y-4">
          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}
          {fieldErrors?.name && (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.name}
            </p>
          )}
          <TextInput
            id="register-name"
            name="name"
            type="text"
            placeholder="Full name"
            value={registerData.name}
            onChange={(e) =>
              setRegisterData({ ...registerData, name: e.target.value })
            }
            required
            autoComplete="name"
          />
          {fieldErrors?.email && (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.email}
            </p>
          )}
          <TextInput
            id="register-email"
            name="email"
            type="email"
            placeholder="Email address"
            value={registerData.email}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                email: e.target.value,
              })
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
            id="register-password"
            name="password"
            type="password"
            placeholder="Password"
            value={registerData.password}
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password: e.target.value,
              })
            }
            required
            autoComplete="new-password"
          />
          {fieldErrors?.confirmPassword && (
            <p className="text-sm text-red-600" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
          <TextInput
            id="register-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={registerData.confirmPassword}
            onChange={(e) =>
              setRegisterData({
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
        <span>Return to</span>
        <a
          href="#"
          onClick={() => {
            clearErrors();
            setShowLoginModal(true);
          }}
          className="text-blue-600 font-medium hover:underline"
        >
          Sign In
        </a>
      </div>
    </Modal>
  );
};

export default RegisterModal;
