import { apiRequest } from "./core";
import type {
  AuthResponse,
  LoginData,
  ProfileResponse,
  RegisterData,
  ResendVerificationResponse,
  VerifyEmailData,
  VerifyEmailResponse,
} from "./types";

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    return await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    return await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    return await apiRequest<ProfileResponse>("/api/auth/profile", {
      method: "GET",
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

export const verifyEmail = async (
  data: VerifyEmailData,
): Promise<VerifyEmailResponse> => {
  try {
    return await apiRequest<VerifyEmailResponse>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

export const resendVerification = async (data: {
  email: string;
}): Promise<ResendVerificationResponse> => {
  try {
    return await apiRequest<ResendVerificationResponse>(
      "/api/auth/resend-verification",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};
