import { Request, Response } from "express";
import {
  resendVerificationOtp,
  verifyEmailOtp,
} from "../services/emailVerificationService";

interface VerifyEmailRequest {
  email: string;
  otp: string;
}

interface AuthFieldErrors {
  email?: string;
  otp?: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  email?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  resendAvailableInSeconds?: number;
  fieldErrors?: AuthFieldErrors;
}

interface ResendVerificationRequest {
  email: string;
}

interface ResendVerificationResponse {
  success: boolean;
  message: string;
  email?: string;
  resendAvailableInSeconds?: number;
  fieldErrors?: AuthFieldErrors;
}

export const verifyEmail = async (
  req: Request<object, VerifyEmailResponse, VerifyEmailRequest>,
  res: Response<VerifyEmailResponse>,
): Promise<void> => {
  try {
    const result = await verifyEmailOtp(req.body);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const resendVerification = async (
  req: Request<object, ResendVerificationResponse, ResendVerificationRequest>,
  res: Response<ResendVerificationResponse>,
): Promise<void> => {
  try {
    const result = await resendVerificationOtp(req.body);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
