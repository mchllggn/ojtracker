import { API_BASE_URL, AuthResponse, LoginData } from "./authTypes";

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
        message: result.message || "Login failed",
        ...(fieldErrors ? { fieldErrors } : {}),
      };
    }

    return result;
  } catch (error) {
    console.error("Login request error:", error);
    return {
      success: false,
      message: "Network error. Please check if the server is running.",
    };
  }
};
