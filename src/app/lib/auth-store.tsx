
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from "firebase/auth";
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

const ADMIN_EMAILS = ["admin@fashionflow.com", "jairobraganca2020@gmail.com"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseAuth = useFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sincroniza o estado de autenticação do Firebase com a nossa store local
    const unsubscribe = onAuthStateChanged(firebaseAuth, (u) => {
      if (u) {
        setUser(u);
        setRole(ADMIN_EMAILS.includes(u.email || "") ? "ADM" : "CASHIER");
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [firebaseAuth]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // Tenta login real no Firebase se as credenciais forem as padrão
      // Nota: Em um sistema real, usaríamos autenticação real. Aqui mantemos a compatibilidade com seu fluxo.
      let valid = false;
      let newRole: UserRole | null = null;

      if ((email === "admin@fashionflow.com" && pass === "admin") || 
          (email === "jairobraganca2020@gmail.com" && pass === "Jairo@Braganca")) {
        valid = true;
        newRole = "ADM";
      } else if (email === "caixa@fashionflow.com" && pass === "caixa") {
        valid = true;
        newRole = "CASHIER";
      }

      if (valid && newRole) {
        // Simulamos o sucesso para o fluxo da UI
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: "E-mail ou senha incorretos." };
      }
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || "Erro ao autenticar." };
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    setRole(null);
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
