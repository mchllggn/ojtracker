import { Request, Response } from "express";
import { register as registerService } from "../services/registerService";

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

export const register = async (
  req: Request<object, RegisterResponse, RegisterRequest>,
  res: Response<RegisterResponse>,
): Promise<void> => {
  try {
    const result = await registerService(req.body);

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
