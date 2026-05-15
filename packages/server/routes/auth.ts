import express, { Router } from "express";
import { register } from "../controllers/registerController";
import { login } from "../controllers/loginController";
import { getProfile } from "../controllers/profileController";
import {
  resendVerification,
  verifyEmail,
} from "../controllers/emailVerificationController";
import { authenticateToken } from "../middleware/auth";

const router: Router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Protected routes
router.get("/profile", authenticateToken, getProfile);

export default router;
