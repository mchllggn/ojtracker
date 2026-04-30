import { useCallback, useState } from "react";
import {
  login,
  register,
  type LoginFieldErrors,
  type RegisterFieldErrors,
  type User,
} from "../apis";

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const defaultRegisterData: RegisterData = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const useIndexAuthForms = () => {
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [loginFieldErrors, setLoginFieldErrors] = useState<LoginFieldErrors>(
    {},
  );

  const [registerData, setRegisterData] =
    useState<RegisterData>(defaultRegisterData);
  const [registerError, setRegisterError] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] =
    useState<RegisterFieldErrors>({});

  const clearLoginErrors = useCallback(() => {
    setLoginError("");
    setLoginFieldErrors({});
  }, []);

  const clearRegisterErrors = useCallback(() => {
    setRegisterError("");
    setRegisterFieldErrors({});
  }, []);

  const updateLoginData = (data: LoginData) => {
    setLoginData(data);
    clearLoginErrors();
  };

  const updateRegisterData = (data: RegisterData) => {
    setRegisterData(data);
    clearRegisterErrors();
  };

  const handleLogin = async (
    e: React.FormEvent,
    onSuccess: (user: User, token: string) => void,
    onVerificationRequired: (email: string) => void,
  ) => {
    e.preventDefault();
    clearLoginErrors();

    const response = await login({
      email: loginData.email,
      password: loginData.password,
    });

    if (response.success && response.user && response.token) {
      onSuccess(response.user, response.token);
      return;
    }

    if (response.verificationRequired && response.email) {
      onVerificationRequired(response.email);
      return;
    }

    const fieldErrors = (response.fieldErrors ?? {}) as LoginFieldErrors;
    setLoginFieldErrors(fieldErrors);
    if (!fieldErrors.email && !fieldErrors.password) {
      setLoginError(response.message || "Login failed. Please try again.");
    }
  };

  const handleRegister = async (
    e: React.FormEvent,
    onVerificationRequired: (email: string) => void,
  ) => {
    e.preventDefault();
    clearRegisterErrors();

    const response = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
      confirmPassword: registerData.confirmPassword,
    });

    if (response.success) {
      clearRegisterErrors();
      setRegisterData(defaultRegisterData);
      onVerificationRequired(response.email ?? registerData.email);
      return;
    }

    const fieldErrors = (response.fieldErrors ?? {}) as RegisterFieldErrors;
    setRegisterFieldErrors(fieldErrors);
    if (
      !fieldErrors.name &&
      !fieldErrors.email &&
      !fieldErrors.password &&
      !fieldErrors.confirmPassword
    ) {
      setRegisterError(
        response.message || "Registration failed. Please try again.",
      );
    }
  };

  return {
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
  };
};
