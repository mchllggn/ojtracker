import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { sendVerificationEmail } from "./emailService";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

interface AuthUserResponse {
  id: number;
  name: string;
  email: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface AuthFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  verificationRequired?: boolean;
  email?: string;
  resendAvailableInSeconds?: number;
  fieldErrors?: AuthFieldErrors;
}

interface VerifyEmailRequest {
  email: string;
  otp: string;
}

interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user?: AuthUserResponse;
  token?: string;
  resendAvailableInSeconds?: number;
  email?: string;
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

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidOtp = (otp: string): boolean => /^\d{6}$/.test(otp);

const buildUserResponse = (user: {
  id: number;
  name: string;
  email: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

const generateOtp = (): string => {
  const min = 100000;
  const max = 999999;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

const buildVerificationDeadline = (minutes: number): Date =>
  new Date(Date.now() + minutes * 60 * 1000);

const buildResendAvailableAt = (seconds: number): Date =>
  new Date(Date.now() + seconds * 1000);

const getResendCooldownSeconds = (availableAt?: Date | null): number => {
  if (!availableAt) {
    return 0;
  }

  const remaining = Math.ceil((availableAt.getTime() - Date.now()) / 1000);
  return Math.max(0, remaining);
};

const verificationUserSelect = {
  id: true,
  name: true,
  email: true,
  isEmailVerified: true,
  emailVerificationOtpHash: true,
  emailVerificationOtpExpiresAt: true,
  emailVerificationOtpResendAvailableAt: true,
} as const;

export const registerWithEmailVerification = async (
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

  if (name.length < 2) {
    return {
      success: false,
      message: "Name must be at least 2 characters long",
      fieldErrors: {
        name: "Name must be at least 2 characters long",
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

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long",
      fieldErrors: {
        password: "Password must be at least 6 characters long",
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
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = buildVerificationDeadline(OTP_EXPIRY_MINUTES);
  const resendAvailableAt = buildResendAvailableAt(OTP_RESEND_COOLDOWN_SECONDS);

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

export const verifyEmailOtp = async (
  data: VerifyEmailRequest,
): Promise<VerifyEmailResponse> => {
  const rawEmail = data?.email ?? "";
  const rawOtp = data?.otp ?? "";
  const email = normalizeEmail(rawEmail);
  const otp = rawOtp.trim();

  if (!email || !otp) {
    return {
      success: false,
      message: "Email and verification code are required",
      fieldErrors: {
        ...(!email ? { email: "Email is required" } : {}),
        ...(!otp ? { otp: "Verification code is required" } : {}),
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

  if (!isValidOtp(otp)) {
    return {
      success: false,
      message: "Verification code must be 6 digits",
      fieldErrors: {
        otp: "Verification code must be 6 digits",
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: verificationUserSelect,
  });

  if (!user) {
    return {
      success: false,
      message: "Account not found",
      fieldErrors: {
        email: "Account not found",
      },
    };
  }

  if (user.isEmailVerified) {
    return {
      success: true,
      message: "Account is already verified.",
      email: user.email,
      resendAvailableInSeconds: 0,
      user: buildUserResponse(user),
    };
  }

  const otpExpiresAt = user.emailVerificationOtpExpiresAt as Date | null;
  const otpResendAvailableAt =
    user.emailVerificationOtpResendAvailableAt as Date | null;

  if (!user.emailVerificationOtpHash || !otpExpiresAt) {
    return {
      success: false,
      message: "Verification code has expired. Please resend a new code.",
      email: user.email,
      resendAvailableInSeconds: getResendCooldownSeconds(otpResendAvailableAt),
      fieldErrors: {
        otp: "Verification code has expired. Please resend a new code.",
      },
    };
  }

  if (otpExpiresAt.getTime() < Date.now()) {
    return {
      success: false,
      message: "Verification code has expired. Please resend a new code.",
      email: user.email,
      resendAvailableInSeconds: getResendCooldownSeconds(otpResendAvailableAt),
      fieldErrors: {
        otp: "Verification code has expired. Please resend a new code.",
      },
    };
  }

  const isOtpValid = await bcrypt.compare(otp, user.emailVerificationOtpHash);
  if (!isOtpValid) {
    return {
      success: false,
      message: "Invalid verification code",
      email: user.email,
      resendAvailableInSeconds: getResendCooldownSeconds(otpResendAvailableAt),
      fieldErrors: {
        otp: "Invalid verification code",
      },
    };
  }

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      isEmailVerified: true,
      emailVerificationOtpHash: null,
      emailVerificationOtpExpiresAt: null,
      emailVerificationOtpResendAvailableAt: null,
    },
    select: verificationUserSelect,
  });

  const token = jwt.sign(
    { userId: updatedUser.id, email: updatedUser.email },
    JWT_SECRET,
    {
      expiresIn: "24h",
    },
  );

  return {
    success: true,
    message: "Email verified successfully.",
    email: updatedUser.email,
    user: buildUserResponse(updatedUser),
    token,
  };
};

export const resendVerificationOtp = async (
  data: ResendVerificationRequest,
): Promise<ResendVerificationResponse> => {
  const rawEmail = data?.email ?? "";
  const email = normalizeEmail(rawEmail);

  if (!email) {
    return {
      success: false,
      message: "Email is required",
      fieldErrors: {
        email: "Email is required",
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

  const user = await prisma.user.findUnique({
    where: { email },
    select: verificationUserSelect,
  });

  if (!user) {
    return {
      success: false,
      message: "Account not found",
      fieldErrors: {
        email: "Account not found",
      },
    };
  }

  if (user.isEmailVerified) {
    return {
      success: false,
      message: "Account is already verified.",
      email: user.email,
    };
  }

  const otpResendAvailableAt =
    user.emailVerificationOtpResendAvailableAt as Date | null;
  const resendAvailableInSeconds =
    getResendCooldownSeconds(otpResendAvailableAt);

  if (resendAvailableInSeconds > 0) {
    return {
      success: false,
      message: "Please wait before requesting a new code.",
      email: user.email,
      resendAvailableInSeconds,
      fieldErrors: {
        email: `You can resend a new code in ${resendAvailableInSeconds} seconds.`,
      },
    };
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = buildVerificationDeadline(OTP_EXPIRY_MINUTES);
  const nextResendAvailableAt = buildResendAvailableAt(
    OTP_RESEND_COOLDOWN_SECONDS,
  );

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      emailVerificationOtpHash: otpHash,
      emailVerificationOtpExpiresAt: expiresAt,
      emailVerificationOtpResendAvailableAt: nextResendAvailableAt,
    },
    select: verificationUserSelect,
  });

  await sendVerificationEmail({
    to: updatedUser.email,
    name: updatedUser.name,
    otp,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  });

  return {
    success: true,
    message: "A new verification code has been sent.",
    email: updatedUser.email,
    resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
  };
};
