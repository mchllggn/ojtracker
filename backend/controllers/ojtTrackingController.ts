import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  getOjtTracking as getOjtTrackingService,
  startOjtTracking as startOjtTrackingService,
  addDutyHours as addDutyHoursService,
  updateDutyLog as updateDutyLogService,
  deleteDutyLog as deleteDutyLogService,
  resetOjtTracking as resetOjtTrackingService,
} from "../services/ojtTrackingService";

// Get OJT tracking data for the authenticated user
export const getOjtTracking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await getOjtTrackingService(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error("Get OJT tracking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Start OJT tracking
export const startOjtTracking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await startOjtTrackingService(req.user.userId, req.body);

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Start OJT tracking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add duty hours
export const addDutyHours = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await addDutyHoursService(req.user.userId, req.body);

    const statusCode = result.success
      ? 200
      : result.message?.includes("not found")
        ? 404
        : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Add duty hours error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update specific duty log
export const updateDutyLog = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const dutyLogIdParam = req.params.id;
    const dutyLogId = dutyLogIdParam ? parseInt(dutyLogIdParam, 10) : NaN;
    if (!dutyLogIdParam || Number.isNaN(dutyLogId)) {
      res
        .status(400)
        .json({ success: false, message: "Duty log id is required" });
      return;
    }

    const result = await updateDutyLogService(
      req.user.userId,
      dutyLogId,
      req.body,
    );

    const statusCode = result.success
      ? 200
      : result.message?.includes("not found")
        ? 404
        : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Update duty log error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete specific duty log
export const deleteDutyLog = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const dutyLogIdParam = req.params.id;
    const dutyLogId = dutyLogIdParam ? parseInt(dutyLogIdParam, 10) : NaN;
    if (!dutyLogIdParam || Number.isNaN(dutyLogId)) {
      res
        .status(400)
        .json({ success: false, message: "Duty log id is required" });
      return;
    }

    const result = await deleteDutyLogService(req.user.userId, dutyLogId);

    const statusCode = result.success
      ? 200
      : result.message?.includes("not found")
        ? 404
        : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Delete duty log error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Reset OJT tracking
export const resetOjtTracking = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await resetOjtTrackingService(req.user.userId);

    const statusCode = result.success ? 200 : 404;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Reset OJT tracking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
