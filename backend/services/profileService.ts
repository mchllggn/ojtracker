import { API_BASE_URL, ProfileResponse } from "./authTypes";

export const getProfile = async (token: string): Promise<ProfileResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return (await response.json()) as ProfileResponse;
};
