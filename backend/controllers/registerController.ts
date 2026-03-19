import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

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
  req: Request<object, RegisterResponse, RegisterRequest>,
  res: Response<RegisterResponse>,
): Promise<void> => {
  try {
    const rawName = req.body?.name ?? "";
    const rawEmail = req.body?.email ?? "";
    const password = req.body?.password ?? "";
    const confirmPassword = req.body?.confirmPassword ?? "";

    const name = rawName.trim();
    const email = normalizeEmail(rawEmail);

    if (!name || !email || !password || !confirmPassword) {
      res.status(400).json({
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
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match",
        fieldErrors: {
          confirmPassword: "Passwords do not match",
        },
      });
      return;
    }

    if (name.length < MIN_NAME_LENGTH) {
      res.status(400).json({
        success: false,
        message: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
        fieldErrors: {
          name: `Name must be at least ${MIN_NAME_LENGTH} characters long`,
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

    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        fieldErrors: {
          password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
        },
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message:
          "Email already registered. Please use a different email or login.",
        fieldErrors: {
          email:
            "Email already registered. Please use a different email or login.",
        },
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful! You can now login with your credentials.",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
