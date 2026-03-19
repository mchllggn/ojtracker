export const API_BASE_URL = "http://localhost:3000/api";

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

export interface ProfileResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  fieldErrors?: LoginFieldErrors | RegisterFieldErrors;
}
