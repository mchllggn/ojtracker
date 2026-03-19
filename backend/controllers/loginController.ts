import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

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

export const login = async (
  req: Request<object, LoginResponse, LoginRequest>,
  res: Response<LoginResponse>,
): Promise<void> => {
  try {
    const rawEmail = req.body?.email ?? "";
    const password = req.body?.password ?? "";

    const email = normalizeEmail(rawEmail);

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required",
        fieldErrors: {
          ...(!email ? { email: "Email is required" } : {}),
          ...(!password ? { password: "Password is required" } : {}),
        },
      });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
        fieldErrors: {
          email: "Please enter a valid email address",
        },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        fieldErrors: {
          email: "Invalid email or password",
          password: "Invalid email or password",
        },
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
        fieldErrors: {
          email: "Invalid email or password",
          password: "Invalid email or password",
        },
      });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
