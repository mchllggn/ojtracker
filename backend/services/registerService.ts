import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;

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

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return {
    success: true,
    message:
      "Registration successful! You can now login with your credentials.",
  };
};
