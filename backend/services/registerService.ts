import { API_BASE_URL } from "./authTypes";
import type { AuthResponse, RegisterData } from "./authTypes";

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = (await response.json()) as AuthResponse;

    if (!response.ok) {
      const fieldErrors = result.fieldErrors;
      return {
        success: false,
        message: result.message || "Registration failed",
        ...(fieldErrors ? { fieldErrors } : {}),
      };
    }

    return result;
  } catch (error) {
    console.error("Register request error:", error);
    return {
      success: false,
      message: "Network error. Please check if the server is running.",
    };
  }
};
