import { useCallback, useEffect, useState } from "react";
import { authStorage, type User } from "../apis";
import { AUTH_CHANGE_EVENT, emitAuthChange } from "../apis/authEvents";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};

const getAuthState = (): AuthState => {
  const currentUser = authStorage.getUser();
  const authenticated = !!currentUser && authStorage.isAuthenticated();

  return {
    user: authenticated ? currentUser : null,
    isAuthenticated: authenticated,
  };
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => getAuthState());

  const refreshAuth = useCallback(() => {
    setAuthState(getAuthState());
  }, []);

  const login = useCallback((user: User, token: string) => {
    authStorage.setUser(user, token);
    setAuthState({ user, isAuthenticated: true });
    emitAuthChange();
  }, []);

  const logout = useCallback(() => {
    authStorage.logout();
    setAuthState({ user: null, isAuthenticated: false });
    emitAuthChange();
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState(getAuthState());
    };

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    refreshAuth,
  };
};
