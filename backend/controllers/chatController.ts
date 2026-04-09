import { Request, Response } from "express";
import { askGemini, ChatResponse } from "../services/chatService";

interface ChatBody {
  message: string;
}

export const chat = async (
  req: Request<object, ChatResponse, ChatBody>,
  res: Response<ChatResponse>,
): Promise<void> => {
  try {
    const result = await askGemini(req.body);
    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Chat controller error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while generating response.",
    });
  }
};
