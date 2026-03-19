import type { User } from "./authTypes";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);
const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

const getUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

const setUser = (user: User, token: string): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setToken(token);
};

const removeUser = (): void => localStorage.removeItem(USER_KEY);

const logout = (): void => {
  removeToken();
  removeUser();
};

const isAuthenticated = (): boolean => !!getToken();

export const authStorage = {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  logout,
  isAuthenticated,
};
