import { useState } from "react";
import type { OjtTracking } from "../apis";

export const useGuestTracking = () => {
  const [isGuestTracking, setIsGuestTracking] = useState(false);
  const [guestTrackingData, setGuestTrackingData] =
    useState<OjtTracking | null>(null);
  const [completedHours, setCompletedHours] = useState(0);
  const [todayDutyHours, setTodayDutyHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startGuestTracking = (tracking: OjtTracking) => {
    setGuestTrackingData(tracking);
    setCompletedHours(0);
    setIsGuestTracking(true);
  };

  const addTodayDuty = async (hoursOverride?: number) => {
    const hours = hoursOverride ?? parseFloat(todayDutyHours);
    if (isNaN(hours) || hours <= 0) {
      alert("Please enter valid hours");
      return;
    }

    if (!guestTrackingData) return;

    const hasTimedInToday = (guestTrackingData.dutyLogs ?? []).some((log) => {
      const logDate = new Date(log.date);
      const today = new Date();

      return (
        logDate.getFullYear() === today.getFullYear() &&
        logDate.getMonth() === today.getMonth() &&
        logDate.getDate() === today.getDate()
      );
    });

    if (hasTimedInToday) {
      alert("You already timed in today.");
      return;
    }

    setIsLoading(true);
    const roundedHours = Math.round(hours);
    if (roundedHours <= 0) {
      alert("Please enter valid hours");
      setIsLoading(false);
      return;
    }

    const nextDutyLogId =
      (guestTrackingData.dutyLogs?.length
        ? Math.max(...guestTrackingData.dutyLogs.map((log) => log.id))
        : 0) + 1;

    const updatedCompletedHours = Math.min(
      Math.round(completedHours + roundedHours),
      Math.round(guestTrackingData.totalHours),
    );
    setCompletedHours(updatedCompletedHours);
    setGuestTrackingData({
      ...guestTrackingData,
      completedHours: updatedCompletedHours,
      dutyLogs: [
        ...(guestTrackingData.dutyLogs ?? []),
        {
          id: nextDutyLogId,
          date: new Date(),
          hoursWorked: roundedHours,
        },
      ],
      updatedAt: new Date(),
    });
    setTodayDutyHours("");
    setIsLoading(false);
  };

  const resetTracking = async () => {
    if (!confirm("Are you sure you want to reset your tracking data?")) {
      return;
    }

    setIsGuestTracking(false);
    setGuestTrackingData(null);
    setCompletedHours(0);
    setTodayDutyHours("");
  };

  const getProgressPercentage = () => {
    if (!guestTrackingData) return 0;
    return Math.round(
      Math.min((completedHours / guestTrackingData.totalHours) * 100, 100),
    );
  };

  const getRemainingHours = () => {
    if (!guestTrackingData) return 0;
    return Math.round(
      Math.max(guestTrackingData.totalHours - completedHours, 0),
    );
  };

  const handleEditGuestDutyLog = async (
    dutyLogId: number,
    hoursWorked: number,
  ) => {
    if (!guestTrackingData) return;

    const roundedHours = Math.round(hoursWorked);
    if (roundedHours <= 0) {
      alert("Please enter valid hours.");
      return;
    }

    const targetLog = guestTrackingData.dutyLogs?.find(
      (log) => log.id === dutyLogId,
    );
    if (!targetLog) return;

    const delta = roundedHours - targetLog.hoursWorked;
    const nextCompletedHours = Math.min(
      Math.max(0, completedHours + delta),
      Math.round(guestTrackingData.totalHours),
    );

    setCompletedHours(nextCompletedHours);
    setGuestTrackingData({
      ...guestTrackingData,
      completedHours: nextCompletedHours,
      dutyLogs: (guestTrackingData.dutyLogs ?? []).map((log) =>
        log.id === dutyLogId ? { ...log, hoursWorked: roundedHours } : log,
      ),
      updatedAt: new Date(),
    });
  };

  const handleDeleteGuestDutyLog = async (dutyLogId: number) => {
    if (!guestTrackingData) return;

    const targetLog = guestTrackingData.dutyLogs?.find(
      (log) => log.id === dutyLogId,
    );
    if (!targetLog) return;

    const nextCompletedHours = Math.max(
      0,
      completedHours - targetLog.hoursWorked,
    );

    setCompletedHours(nextCompletedHours);
    setGuestTrackingData({
      ...guestTrackingData,
      completedHours: nextCompletedHours,
      dutyLogs: (guestTrackingData.dutyLogs ?? []).filter(
        (log) => log.id !== dutyLogId,
      ),
      updatedAt: new Date(),
    });
  };

  return {
    isGuestTracking,
    guestTrackingData,
    completedHours,
    todayDutyHours,
    isLoading,
    setTodayDutyHours,
    startGuestTracking,
    addTodayDuty,
    resetTracking,
    getProgressPercentage,
    getRemainingHours,
    handleEditGuestDutyLog,
    handleDeleteGuestDutyLog,
  };
};
