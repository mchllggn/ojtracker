import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
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

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const buildUserResponse = (user: {
  id: number;
  name: string;
  email: string;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
});

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const rawEmail = data?.email ?? "";
  const password = data?.password ?? "";

  const email = normalizeEmail(rawEmail);

  if (!email || !password) {
    return {
      success: false,
      message: "Email and password are required",
      fieldErrors: {
        ...(!email ? { email: "Email is required" } : {}),
        ...(!password ? { password: "Password is required" } : {}),
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
  });

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
      fieldErrors: {
        email: "Invalid email or password",
        password: "Invalid email or password",
      },
    };
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return {
      success: false,
      message: "Invalid email or password",
      fieldErrors: {
        email: "Invalid email or password",
        password: "Invalid email or password",
      },
    };
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "24h",
  });

  return {
    success: true,
    message: "Login successful",
    token,
    user: buildUserResponse(user),
  };
};
