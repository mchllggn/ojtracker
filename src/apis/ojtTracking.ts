import { apiRequest } from "./core";
import type { OjtTrackingResponse } from "./types";

export const getOjtTracking = async (): Promise<OjtTrackingResponse> => {
  return apiRequest<OjtTrackingResponse>("/api/ojt", {
    method: "GET",
  });
};

export const startTracking = async (payload: {
  startDate: string;
  totalHours: number;
  dutyHoursPerDay: number;
  totalDays: number;
}): Promise<OjtTrackingResponse> => {
  return apiRequest<OjtTrackingResponse>("/api/ojt/start", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const addDutyHours = async (payload: {
  hoursWorked: number;
  date?: string;
}): Promise<OjtTrackingResponse> => {
  return apiRequest<OjtTrackingResponse>("/api/ojt/duty", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateDutyLog = async (
  dutyLogId: number,
  payload: { hoursWorked: number },
): Promise<OjtTrackingResponse> => {
  return apiRequest<OjtTrackingResponse>(`/api/ojt/duty/${dutyLogId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteDutyLog = async (
  dutyLogId: number,
): Promise<OjtTrackingResponse> => {
  return apiRequest<OjtTrackingResponse>(`/api/ojt/duty/${dutyLogId}`, {
    method: "DELETE",
  });
};

export const resetTracking = async (): Promise<OjtTrackingResponse> => {
  return apiRequest<OjtTrackingResponse>("/api/ojt/reset", {
    method: "DELETE",
  });
};
