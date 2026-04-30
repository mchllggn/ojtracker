import { apiRequest } from "./core";
import type { ChatResponse } from "./types";

export const sendChatMessage = async (
  message: string,
): Promise<ChatResponse> => {
  try {
    return await apiRequest<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    const normalizedMessage =
      error instanceof Error
        ? error.message
        : "Network error. Please try again.";

    // Backend error bodies are JSON strings; parse when possible for friendlier messages.
    try {
      const parsed = JSON.parse(normalizedMessage) as { message?: string };
      return {
        success: false,
        message: parsed.message || normalizedMessage,
      };
    } catch {
      return {
        success: false,
        message: normalizedMessage,
      };
    }
  }
};
