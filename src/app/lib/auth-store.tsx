
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export type UserRole = "ADM" | "CASHIER";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For prototype simplicity, we also check localStorage if no real Firebase user
    const savedUser = localStorage.getItem("ff_mock_user");
    if (savedUser) {
      const u = JSON.parse(savedUser);
      setUser(u);
      setRole(u.email === "admin@fashionflow.com" ? "ADM" : "CASHIER");
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        setRole(u.email === "admin@fashionflow.com" ? "ADM" : "CASHIER");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    // Prototype Mock Login
    setLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const mockUser = { email, uid: "mock-uid-" + Date.now() } as User;
        setUser(mockUser);
        const newRole = email === "admin@fashionflow.com" ? "ADM" : "CASHIER";
        setRole(newRole);
        localStorage.setItem("ff_mock_user", JSON.stringify(mockUser));
        setLoading(false);
        resolve();
      }, 800);
    });
  };

  const logout = async () => {
    localStorage.removeItem("ff_mock_user");
    setUser(null);
    setRole(null);
    await auth.signOut();
  };

  const isAdmin = role === "ADM";

  return (
    <AuthContext.Provider value={{ user, role, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
