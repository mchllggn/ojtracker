import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { getProfile as getProfileService } from "../services/profileService";

export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await getProfileService(req.user.userId);

    if (!result.success) {
      res.status(404).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
