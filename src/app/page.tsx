
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "./lib/auth-store";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * NexusFlow Login Page - Ultra Compact Minimalist Window
 * 
 * Janela reduzida em mais 30% (max-w-sm), com layout horizontal responsivo.
 * Otimizado para todos os dispositivos.
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    const result = await login(email, password);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message || "E-mail ou senha incorretos.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] p-4 font-body overflow-hidden">
      {/* Janela Central (Ultra Compacta - Reduzida em 30%) */}
      <div className="w-full max-w-[400px] bg-[#1E293B] rounded-2xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-500">
        
        {/* Lado Esquerdo: Branding (Compacto) */}
        <div className="sm:w-1/3 bg-[#1E3A8A] p-4 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-white/5">
          <div className="space-y-3">
            <div className="mx-auto w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/20">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-headline font-bold text-white tracking-tight">NexusFlow</h1>
              <p className="text-blue-100/40 text-[6px] font-bold uppercase tracking-widest mt-1">Gestão</p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário (Focado) */}
        <div className="sm:w-2/3 p-6 bg-[#1E293B]">
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Acesso</h2>
              <p className="text-slate-400 text-[10px] font-medium">Insira suas credenciais.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-1.5 px-2 rounded-lg border-none bg-red-900/20 text-red-400 text-[9px] animate-in slide-in-from-top-2">
                  <AlertCircle className="h-3 w-3" />
                  <AlertDescription className="font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[8px] font-bold uppercase text-slate-500 tracking-widest pl-1">
                    E-mail
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="exemplo@nexusflow.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 bg-[#0F172A]/40 border-white/10 text-white rounded-lg px-3 focus:ring-[#3B82F6] transition-all text-[11px] placeholder:text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pass" className="text-[8px] font-bold uppercase text-slate-500 tracking-widest pl-1">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input 
                      id="pass"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-9 bg-[#0F172A]/40 border-white/10 text-white rounded-lg px-3 pr-9 focus:ring-[#3B82F6] transition-all text-[11px] placeholder:text-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#3B82F6]"
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-9 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold tracking-widest transition-all shadow-lg shadow-[#3B82F6]/20 text-[9px]"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "ENTRAR"
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-2 opacity-20 pt-2">
              <ShieldCheck className="h-3 w-3 text-[#3B82F6]" />
              <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-white">
                Seguro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
