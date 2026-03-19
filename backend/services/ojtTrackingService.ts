const API_BASE_URL = "http://localhost:3000/api";

export interface OjtTrackingData {
  startDate: Date;
  totalHours: number;
  dutyHoursPerDay: number;
  submissionHours: number;
  totalDays: number;
  completedHours: number;
}

export interface DutyLog {
  id: number;
  date: Date;
  hoursWorked: number;
}

export interface OjtTracking extends OjtTrackingData {
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  dutyLogs?: DutyLog[];
}

export interface OjtTrackingResponse {
  success: boolean;
  tracking?: OjtTracking | null;
  message?: string;
}

export interface StartTrackingRequest {
  startDate: string;
  totalHours: number;
  dutyHoursPerDay: number;
  submissionHours: number;
  totalDays: number;
}

export interface AddDutyRequest {
  hoursWorked: number;
  date?: string;
}

export interface UpdateDutyRequest {
  hoursWorked: number;
}

class OjtTrackingService {
  private getAuthToken(): string | null {
    return localStorage.getItem("token");
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getOjtTracking(): Promise<OjtTrackingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ojt`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });

      const result = (await response.json()) as OjtTrackingResponse;

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Failed to fetch OJT tracking",
        };
      }

      return result;
    } catch (error) {
      console.error("Get OJT tracking error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  async startTracking(
    data: StartTrackingRequest,
  ): Promise<OjtTrackingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ojt/start`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as OjtTrackingResponse;

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Failed to start tracking",
        };
      }

      return result;
    } catch (error) {
      console.error("Start tracking error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  async addDutyHours(data: AddDutyRequest): Promise<OjtTrackingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ojt/duty`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as OjtTrackingResponse;

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Failed to add duty hours",
        };
      }

      return result;
    } catch (error) {
      console.error("Add duty hours error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  async updateDutyLog(
    dutyLogId: number,
    data: UpdateDutyRequest,
  ): Promise<OjtTrackingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ojt/duty/${dutyLogId}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as OjtTrackingResponse;

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Failed to update duty log",
        };
      }

      return result;
    } catch (error) {
      console.error("Update duty log error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  async deleteDutyLog(dutyLogId: number): Promise<OjtTrackingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ojt/duty/${dutyLogId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const result = (await response.json()) as OjtTrackingResponse;

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Failed to delete duty log",
        };
      }

      return result;
    } catch (error) {
      console.error("Delete duty log error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  async resetTracking(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ojt/reset`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Failed to reset tracking",
        };
      }

      return result;
    } catch (error) {
      console.error("Reset tracking error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}

export default new OjtTrackingService();
