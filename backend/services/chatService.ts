import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const GEMINI_MODEL = "gemini-2.5-flash";

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  message?: string;
}

const getApiKey = (): string | null => {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ??
    process.env.GEMINI_API_KEY?.trim();
  return apiKey ? apiKey : null;
};

export const askGemini = async (data: ChatRequest): Promise<ChatResponse> => {
  const message = data.message?.trim() ?? "";

  if (!message) {
    return {
      success: false,
      message: "Message is required.",
    };
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      success: false,
      message:
        "GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) is not configured on the server.",
    };
  }

  try {
    const google = createGoogleGenerativeAI({ apiKey });

    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      system:
        "You are a helpful assistant. Give clear and concise answers and use plain text.",
      prompt: message,
    });

    const reply = text.trim();

    if (!reply) {
      return {
        success: false,
        message: "AI returned an empty response.",
      };
    }

    return {
      success: true,
      reply,
    };
  } catch (error) {
    console.error("Gemini service error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate AI response.",
    };
  }
};
