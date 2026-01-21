import React, { createContext, useContext, useEffect, useState } from "react";
import storage from "../utils/storage";

// 1️⃣ Create context
const AuthContext = createContext(null);

// 2️⃣ Provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 3️⃣ On app load, hydrate auth state from localStorage
  useEffect(() => {
    const storedToken = storage.get();

    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  // 4️⃣ Login handler
  const login = (jwtToken) => {
    storage.set(jwtToken);
    setToken(jwtToken);
    setIsAuthenticated(true);
  };

  // 5️⃣ Logout handler
  const logout = () => {
    storage.remove();
    setToken(null);
    setIsAuthenticated(false);
  };

  const value = {
    token,
    isAuthenticated,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 6️⃣ Custom hook (clean API)
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
