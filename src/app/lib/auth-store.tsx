
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
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // Simulating role fetching from custom claims or DB
      // For this demo, let's assume 'admin@fashionflow.com' is ADM
      if (u) {
        setRole(u.email === "admin@fashionflow.com" ? "ADM" : "CASHIER");
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    // Basic mock login for the prototype if credentials aren't set
    // In a real app, use signInWithEmailAndPassword(auth, email, pass)
    console.log("Logging in...", email);
  };

  const logout = async () => {
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
