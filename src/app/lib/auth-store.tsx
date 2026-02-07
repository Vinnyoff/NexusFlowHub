"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  signInWithEmailAndPassword, 
  signInAnonymously 
} from "firebase/auth";
import { useAuth as useFirebaseAuth } from "@/firebase";

export type UserRole = "ADM" | "CASHIER";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ["admin@nexusflow.com", "jairobraganca2020@gmail.com"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseAuth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      setUser(u);
      if (u) {
        // Persistência de Role para protótipo
        const savedRole = localStorage.getItem('ff_user_role') as UserRole;
        if (u.email) {
          const newRole = ADMIN_EMAILS.includes(u.email) ? "ADM" : "CASHIER";
          setRole(newRole);
          localStorage.setItem('ff_user_role', newRole);
        } else if (savedRole) {
          setRole(savedRole);
        } else {
          setRole("CASHIER");
        }
      } else {
        setRole(null);
        localStorage.removeItem('ff_user_role');
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseAuth]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Tenta login real via Firebase Auth
      try {
        await signInWithEmailAndPassword(firebaseAuth, email, pass);
        setLoading(false);
        return { success: true };
      } catch (e) {
        // Fallback: Se o usuário não existir no Auth ainda, usamos as credenciais mockadas
        // mas entramos anonimamente para ter um 'request.auth' válido no Firestore
        const isAdminCreds = (email === "admin@nexusflow.com" && pass === "admin") || 
                            (email === "jairobraganca2020@gmail.com" && pass === "Jairo@Braganca");
        const isCashierCreds = email === "caixa@nexusflow.com" && pass === "caixa";

        if (isAdminCreds || isCashierCreds) {
          const newRole = isAdminCreds ? "ADM" : "CASHIER";
          localStorage.setItem('ff_user_role', newRole);
          await signInAnonymously(firebaseAuth);
          setLoading(false);
          return { success: true };
        }
        throw e;
      }
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: "E-mail ou senha incorretos." };
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    localStorage.removeItem('ff_user_role');
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
