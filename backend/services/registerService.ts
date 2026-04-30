import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "./emailService";

const prisma = new PrismaClient();

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  verificationRequired?: boolean;
  email?: string;
  resendAvailableInSeconds?: number;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const register = async (
  data: RegisterRequest,
): Promise<RegisterResponse> => {
  const rawName = data?.name ?? "";
  const rawEmail = data?.email ?? "";
  const password = data?.password ?? "";
  const confirmPassword = data?.confirmPassword ?? "";

  const name = rawName.trim();
  const email = normalizeEmail(rawEmail);

  if (!name || !email || !password || !confirmPassword) {
    return {
      success: false,
      message: "Name, email, password, and confirm password are required",
      fieldErrors: {
        ...(!name ? { name: "Name is required" } : {}),
        ...(!email ? { email: "Email is required" } : {}),
        ...(!password ? { password: "Password is required" } : {}),
        ...(!confirmPassword
          ? { confirmPassword: "Confirm password is required" }
          : {}),
      },
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      message: "Passwords do not match",
      fieldErrors: {
        confirmPassword: "Passwords do not match",
      },
    };
  }

  if (name.length < MIN_NAME_LENGTH) {
    return {
      success: false,
      message: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
      fieldErrors: {
        name: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
      },
    };
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Please enter a valid email address",
      fieldErrors: {
        email: "Please enter a valid email address",
      },
    };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      fieldErrors: {
        password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
      },
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      success: false,
      message:
        "Email already registered. Please use a different email or login.",
      fieldErrors: {
        email:
          "Email already registered. Please use a different email or login.",
      },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const resendAvailableAt = new Date(
    Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000,
  );

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      isEmailVerified: false,
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpiresAt: expiresAt,
      emailVerificationOtpResendAvailableAt: resendAvailableAt,
    },
  });

  try {
    await sendVerificationEmail({
      to: createdUser.email,
      name: createdUser.name,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    await prisma.user.delete({ where: { id: createdUser.id } });
    throw error;
  }

  return {
    success: true,
    message: "Verification code sent to your email.",
    verificationRequired: true,
    email: createdUser.email,
    resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  };
};
