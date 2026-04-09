// ==================== TYPES ====================

export interface DutyLog {
  id: number;
  ojtTrackingId?: number;
  date: string | Date;
  hoursWorked: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OjtTracking {
  id: number;
  userId: number;
  startDate: string | Date;
  totalHours: number;
  dutyHoursPerDay: number;
  totalDays: number;
  completedHours: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  dutyLogs?: DutyLog[];
}

export interface OjtTrackingResponse {
  success: boolean;
  message?: string;
  tracking?: OjtTracking | null;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export interface RegisterFieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  fieldErrors?: LoginFieldErrors | RegisterFieldErrors;
}

export interface ProfileResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  message?: string;
}

// ==================== CONFIG ====================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const TOKEN_KEY = "token";

// ==================== HELPERS ====================

type RequestOptions = RequestInit & {
  query?: Record<string, string | number | boolean | undefined>;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

// ==================== CORE REQUEST ====================

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { query, headers, ...requestInit } = options;

  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

// ==================== AUTH API ====================

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    return await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    return await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

export const getProfile = async (): Promise<ProfileResponse> => {
  try {
    return await apiRequest<ProfileResponse>("/api/auth/profile", {
      method: "GET",
    });
  } catch {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
};

// ==================== OJT TRACKING API ====================

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

// ==================== CHAT API ====================

export const sendChatMessage = async (
  message: string,
): Promise<ChatResponse> => {
  try {
    return await apiRequest<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Network error. Please try again.";

    // Backend error bodies are JSON strings; parse when possible for friendlier messages.
    try {
      const parsed = JSON.parse(message) as { message?: string };
      return {
        success: false,
        message: parsed.message || message,
      };
    } catch {
      return {
        success: false,
        message,
      };
    }
  }
};

// ==================== AUTH STORAGE ====================

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getUser: (): User | null => {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as User) : null;
  },

  setUser: (user: User, token: string): void => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeUser: (): void => {
    localStorage.removeItem("user");
  },

  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
  },

  isAuthenticated: (): boolean => {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};
