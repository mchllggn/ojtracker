import { Request, Response } from "express";
import { login as loginService } from "../services/loginService";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  verificationRequired?: boolean;
  email?: string;
  resendAvailableInSeconds?: number;
  fieldErrors?: {
    email?: string;
    password?: string;
  };
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const login = async (
  req: Request<object, LoginResponse, LoginRequest>,
  res: Response<LoginResponse>,
): Promise<void> => {
  try {
    const result = await loginService(req.body);

    const statusCode = result.success
      ? 200
      : result.verificationRequired
        ? 403
        : 401;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
