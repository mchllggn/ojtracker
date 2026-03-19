import { PrismaClient } from "@prisma/client";
import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

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

    const tracking = await prisma.ojtTracking.findUnique({
      where: { userId: req.user.userId },
      include: {
        dutyLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    res.json({ success: true, tracking });
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

    const {
      startDate,
      totalHours,
      dutyHoursPerDay,
      submissionHours,
      totalDays,
    } = req.body;

    // Validate required fields
    if (
      !startDate ||
      !totalHours ||
      !dutyHoursPerDay ||
      totalDays === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
      return;
    }

    // Check if tracking already exists
    const existingTracking = await prisma.ojtTracking.findUnique({
      where: { userId: req.user.userId },
    });

    if (existingTracking) {
      res.status(400).json({
        success: false,
        message: "OJT tracking already exists. Please reset it first.",
      });
      return;
    }

    const tracking = await prisma.ojtTracking.create({
      data: {
        userId: req.user.userId,
        startDate: new Date(startDate),
        totalHours: parseFloat(totalHours),
        dutyHoursPerDay: parseFloat(dutyHoursPerDay),
        submissionHours: submissionHours ? parseFloat(submissionHours) : 0,
        totalDays: parseInt(totalDays),
        completedHours: 0,
      },
    });

    res.status(201).json({
      success: true,
      message: "OJT tracking started successfully",
      tracking,
    });
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

    const { hoursWorked, date } = req.body;

    if (!hoursWorked || parseFloat(hoursWorked) <= 0) {
      res.status(400).json({
        success: false,
        message: "Valid hours worked is required",
      });
      return;
    }

    let targetDate = new Date();
    if (date) {
      const dateMatch = String(date).match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!dateMatch) {
        res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
        return;
      }

      const [, year, month, day] = dateMatch;
      targetDate = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        0,
        0,
        0,
        0,
      );
    }

    const tracking = await prisma.ojtTracking.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tracking) {
      res.status(404).json({
        success: false,
        message: "OJT tracking not found. Please start tracking first.",
      });
      return;
    }

    const hours = parseFloat(hoursWorked);
    const dayStart = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0,
      0,
      0,
      0,
    );
    const dayEnd = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1,
      0,
      0,
      0,
      0,
    );

    const existingDutyLogs = await prisma.dutyLog.findMany({
      where: {
        ojtTrackingId: tracking.id,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    const existingHoursForDay = existingDutyLogs.reduce(
      (total, log) => total + log.hoursWorked,
      0,
    );

    const completedHoursDelta = hours - existingHoursForDay;

    await prisma.$transaction(async (tx) => {
      if (existingDutyLogs.length > 0) {
        await tx.dutyLog.deleteMany({
          where: {
            id: {
              in: existingDutyLogs.map((log) => log.id),
            },
          },
        });
      }

      await tx.dutyLog.create({
        data: {
          ojtTrackingId: tracking.id,
          date: targetDate,
          hoursWorked: hours,
        },
      });
    });

    const newCompletedHours = Math.max(
      0,
      tracking.completedHours + completedHoursDelta,
    );

    // Update tracking
    const updatedTracking = await prisma.ojtTracking.update({
      where: { id: tracking.id },
      data: {
        completedHours: newCompletedHours,
      },
      include: {
        dutyLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    res.json({
      success: true,
      message: existingDutyLogs.length > 0
        ? "Duty hours updated successfully"
        : "Duty hours added successfully",
      tracking: updatedTracking,
    });
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
    if (!dutyLogIdParam) {
      res.status(400).json({ success: false, message: "Duty log id is required" });
      return;
    }

    const dutyLogId = parseInt(dutyLogIdParam, 10);
    const { hoursWorked } = req.body;

    if (Number.isNaN(dutyLogId)) {
      res.status(400).json({ success: false, message: "Invalid duty log id" });
      return;
    }

    if (!hoursWorked || parseFloat(hoursWorked) <= 0) {
      res.status(400).json({
        success: false,
        message: "Valid hours worked is required",
      });
      return;
    }

    const tracking = await prisma.ojtTracking.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tracking) {
      res.status(404).json({
        success: false,
        message: "OJT tracking not found",
      });
      return;
    }

    const existingDutyLog = await prisma.dutyLog.findFirst({
      where: {
        id: dutyLogId,
        ojtTrackingId: tracking.id,
      },
    });

    if (!existingDutyLog) {
      res.status(404).json({
        success: false,
        message: "Duty log not found",
      });
      return;
    }

    const nextHours = parseFloat(hoursWorked);
    const completedHoursDelta = nextHours - existingDutyLog.hoursWorked;

    await prisma.$transaction(async (tx) => {
      await tx.dutyLog.update({
        where: { id: dutyLogId },
        data: { hoursWorked: nextHours },
      });

      await tx.ojtTracking.update({
        where: { id: tracking.id },
        data: {
          completedHours: Math.max(
            0,
            tracking.completedHours + completedHoursDelta,
          ),
        },
      });
    });

    const updatedTracking = await prisma.ojtTracking.findUnique({
      where: { id: tracking.id },
      include: {
        dutyLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    res.json({
      success: true,
      message: "Duty log updated successfully",
      tracking: updatedTracking,
    });
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
    if (!dutyLogIdParam) {
      res.status(400).json({ success: false, message: "Duty log id is required" });
      return;
    }

    const dutyLogId = parseInt(dutyLogIdParam, 10);
    if (Number.isNaN(dutyLogId)) {
      res.status(400).json({ success: false, message: "Invalid duty log id" });
      return;
    }

    const tracking = await prisma.ojtTracking.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tracking) {
      res.status(404).json({
        success: false,
        message: "OJT tracking not found",
      });
      return;
    }

    const existingDutyLog = await prisma.dutyLog.findFirst({
      where: {
        id: dutyLogId,
        ojtTrackingId: tracking.id,
      },
    });

    if (!existingDutyLog) {
      res.status(404).json({
        success: false,
        message: "Duty log not found",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.dutyLog.delete({
        where: { id: dutyLogId },
      });

      await tx.ojtTracking.update({
        where: { id: tracking.id },
        data: {
          completedHours: Math.max(
            0,
            tracking.completedHours - existingDutyLog.hoursWorked,
          ),
        },
      });
    });

    const updatedTracking = await prisma.ojtTracking.findUnique({
      where: { id: tracking.id },
      include: {
        dutyLogs: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    res.json({
      success: true,
      message: "Duty log deleted successfully",
      tracking: updatedTracking,
    });
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

    const tracking = await prisma.ojtTracking.findUnique({
      where: { userId: req.user.userId },
    });

    if (!tracking) {
      res.status(404).json({
        success: false,
        message: "OJT tracking not found",
      });
      return;
    }

    // Delete tracking (will cascade delete duty logs)
    await prisma.ojtTracking.delete({
      where: { id: tracking.id },
    });

    res.json({
      success: true,
      message: "OJT tracking reset successfully",
    });
  } catch (error) {
    console.error("Reset OJT tracking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
