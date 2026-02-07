
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useAuth as useFirebaseAuth } from "@/firebase";

export type UserRole = "ADM" | "CASHIER";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
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
      // Nota: Em um sistema real com Firebase Auth habilitado, usaríamos signInWithEmailAndPassword(firebaseAuth, email, pass)
      // Aqui simulamos a lógica de validação solicitada para garantir o fluxo imediato.
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
        // Para simplificar o teste, se for um dos e-mails reais, tentamos o login de fato se o usuário existir
        // Mas por padrão mantemos a simulação para o protótipo
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, message: "E-mail ou senha incorretos." };
      }
    } catch (error: any) {
      setLoading(error.message);
      return { success: false, message: error.message || "Erro ao autenticar." };
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const u = result.user;
      setUser(u);
      setRole(ADMIN_EMAILS.includes(u.email || "") ? "ADM" : "CASHIER");
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      setLoading(false);
      return { success: false, message: error.message || "Erro ao entrar com Google." };
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    setRole(null);
  };

  const isAdmin = role === "ADM";

  return (
    <AuthContext.Provider value={{ user, role, loading, isAdmin, login, loginWithGoogle, logout }}>
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
