import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    registerLogoutHandler(() => setIsLoggedIn(false));
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

type LogoutHandler = () => void;

let logoutHandler: LogoutHandler | null = null;

export function registerLogoutHandler(fn: LogoutHandler) {
  logoutHandler = fn;
}

export function triggerLogout() {
  if (logoutHandler) {
    logoutHandler();
  } else {
    console.warn('[authEvents] No logout handler registered yet');
  }
}

export const useAuth = () => useContext(AuthContext);
