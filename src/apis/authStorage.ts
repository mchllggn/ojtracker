import { TOKEN_KEY } from "./config";
import type { User } from "./types";

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
