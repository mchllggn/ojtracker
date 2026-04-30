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
  email?: string;
  verificationRequired?: boolean;
  resendAvailableInSeconds?: number;
  fieldErrors?: LoginFieldErrors | RegisterFieldErrors;
}

export interface VerifyEmailData {
  email: string;
  otp: string;
}

export interface VerifyEmailFieldErrors {
  email?: string;
  otp?: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  email?: string;
  resendAvailableInSeconds?: number;
  fieldErrors?: VerifyEmailFieldErrors;
}

export interface ResendVerificationResponse {
  success: boolean;
  message: string;
  email?: string;
  resendAvailableInSeconds?: number;
  fieldErrors?: VerifyEmailFieldErrors;
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
