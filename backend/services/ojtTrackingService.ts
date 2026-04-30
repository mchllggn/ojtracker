import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface OjtTrackingResponse {
  success: boolean;
  message?: string;
  tracking?: {
    id: number;
    userId: number;
    startDate: Date;
    totalHours: number;
    dutyHoursPerDay: number;
    totalDays: number;
    completedHours: number;
    createdAt: Date;
    updatedAt: Date;
    dutyLogs?: Array<{
      id: number;
      ojtTrackingId: number;
      date: Date;
      hoursWorked: number;
      createdAt: Date;
      updatedAt?: Date;
    }>;
  } | null;
}

interface StartTrackingRequest {
  startDate: string;
  totalHours: number;
  dutyHoursPerDay: number;
  totalDays: number;
}

interface AddDutyRequest {
  hoursWorked: number;
  date?: string;
}

export const getOjtTracking = async (
  userId: number,
): Promise<OjtTrackingResponse> => {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const tracking = await prisma.ojtTracking.findUnique({
    where: { userId },
    include: {
      dutyLogs: {
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  return { success: true, tracking };
};

export const startOjtTracking = async (
  userId: number,
  data: StartTrackingRequest,
): Promise<OjtTrackingResponse> => {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const { startDate, totalHours, dutyHoursPerDay, totalDays } = data;
  const parsedTotalHours = parseFloat(String(totalHours));
  const parsedDutyHoursPerDay = parseFloat(String(dutyHoursPerDay));
  const parsedTotalDays = parseInt(String(totalDays), 10);

  // Validate required fields
  if (
    !startDate ||
    !totalHours ||
    !dutyHoursPerDay ||
    totalDays === undefined
  ) {
    return {
      success: false,
      message: "All fields are required",
    };
  }

  if (
    Number.isNaN(parsedTotalHours) ||
    Number.isNaN(parsedDutyHoursPerDay) ||
    Number.isNaN(parsedTotalDays) ||
    parsedTotalHours <= 0 ||
    parsedDutyHoursPerDay <= 0 ||
    parsedTotalDays <= 0
  ) {
    return {
      success: false,
      message: "Please provide valid positive values.",
    };
  }

  if (parsedDutyHoursPerDay >= parsedTotalHours) {
    return {
      success: false,
      message: "Duty hours per day must be less than total required hours.",
    };
  }

  // Check if tracking already exists
  const existingTracking = await prisma.ojtTracking.findUnique({
    where: { userId },
  });

  if (existingTracking) {
    return {
      success: false,
      message: "OJT tracking already exists. Please reset it first.",
    };
  }

  const tracking = await prisma.ojtTracking.create({
    data: {
      userId,
      startDate: new Date(startDate),
      totalHours: parsedTotalHours,
      dutyHoursPerDay: parsedDutyHoursPerDay,
      totalDays: parsedTotalDays,
      completedHours: 0,
    },
  });

  return {
    success: true,
    message: "OJT tracking started successfully",
    tracking,
  };
};

export const addDutyHours = async (
  userId: number,
  data: AddDutyRequest,
): Promise<OjtTrackingResponse> => {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const { hoursWorked, date } = data;

  if (!hoursWorked || parseFloat(String(hoursWorked)) <= 0) {
    return {
      success: false,
      message: "Valid hours worked is required",
    };
  }

  let targetDate = new Date();
  if (date) {
    const dateMatch = String(date).match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
    if (!dateMatch) {
      return {
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      };
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
    where: { userId },
  });

  if (!tracking) {
    return {
      success: false,
      message: "OJT tracking not found. Please start tracking first.",
    };
  }

  const hours = parseFloat(String(hoursWorked));
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

  return {
    success: true,
    message:
      existingDutyLogs.length > 0
        ? "Duty hours updated successfully"
        : "Duty hours added successfully",
    tracking: updatedTracking,
  };
};

export const updateDutyLog = async (
  userId: number,
  dutyLogId: number,
  data: { hoursWorked: number },
): Promise<OjtTrackingResponse> => {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  if (!dutyLogId || Number.isNaN(dutyLogId)) {
    return { success: false, message: "Invalid duty log id" };
  }

  const { hoursWorked } = data;

  if (!hoursWorked || parseFloat(String(hoursWorked)) <= 0) {
    return {
      success: false,
      message: "Valid hours worked is required",
    };
  }

  const tracking = await prisma.ojtTracking.findUnique({
    where: { userId },
  });

  if (!tracking) {
    return {
      success: false,
      message: "OJT tracking not found",
    };
  }

  const existingDutyLog = await prisma.dutyLog.findFirst({
    where: {
      id: dutyLogId,
      ojtTrackingId: tracking.id,
    },
  });

  if (!existingDutyLog) {
    return {
      success: false,
      message: "Duty log not found",
    };
  }

  const nextHours = parseFloat(String(hoursWorked));
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

  return {
    success: true,
    message: "Duty log updated successfully",
    tracking: updatedTracking,
  };
};

export const deleteDutyLog = async (
  userId: number,
  dutyLogId: number,
): Promise<OjtTrackingResponse> => {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  if (!dutyLogId || Number.isNaN(dutyLogId)) {
    return { success: false, message: "Invalid duty log id" };
  }

  const tracking = await prisma.ojtTracking.findUnique({
    where: { userId },
  });

  if (!tracking) {
    return {
      success: false,
      message: "OJT tracking not found",
    };
  }

  const existingDutyLog = await prisma.dutyLog.findFirst({
    where: {
      id: dutyLogId,
      ojtTrackingId: tracking.id,
    },
  });

  if (!existingDutyLog) {
    return {
      success: false,
      message: "Duty log not found",
    };
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

  return {
    success: true,
    message: "Duty log deleted successfully",
    tracking: updatedTracking,
  };
};

export const resetOjtTracking = async (
  userId: number,
): Promise<OjtTrackingResponse> => {
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const tracking = await prisma.ojtTracking.findUnique({
    where: { userId },
  });

  if (!tracking) {
    return {
      success: false,
      message: "OJT tracking not found",
    };
  }

  // Delete tracking (will cascade delete duty logs)
  await prisma.ojtTracking.delete({
    where: { id: tracking.id },
  });

  return {
    success: true,
    message: "OJT tracking reset successfully",
  };
};
