
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
 * NexusFlow Login Page - Compact Windowed Version
 * 
 * Apresenta uma interface de login encapsulada em um card centralizado com dimensões reduzidas.
 * - Layout Horizontal: Branding à esquerda, Formulário à direita.
 * - Estética: Minimalista, Dark Mode corporativo, sombras de profundidade.
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0F172A] p-6 font-body overflow-hidden">
      {/* Janela Central (Card Compacto - Reduzido em ~20%) */}
      <div className="w-full max-w-3xl bg-[#1E293B] rounded-[2rem] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-700">
        
        {/* Lado Esquerdo: Branding Institucional (Compactado) */}
        <div className="md:w-5/12 bg-[#1E3A8A] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden border-r border-white/5">
          {/* Elementos decorativos de luz sutil */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
          
          <div className="relative z-10 space-y-6">
            <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
              <LayoutGrid className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">NexusFlow</h1>
              <div className="h-0.5 w-10 bg-white/30 mx-auto rounded-full" />
              <p className="text-blue-100/40 text-[9px] font-bold uppercase tracking-[0.4em]">Gestão Inteligente</p>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário de Autenticação (Compactado) */}
        <div className="md:w-7/12 p-8 md:p-12 bg-[#1E293B] flex flex-col justify-center">
          <div className="max-w-xs mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Acesso</h2>
              <p className="text-slate-400 text-xs font-medium">Insira suas credenciais corporativas.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="py-2.5 rounded-xl border-none bg-red-900/20 text-red-400 text-[10px] animate-in slide-in-from-top-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em] pl-1">
                  E-mail Corporativo
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="exemplo@nexusflow.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-[#0F172A]/40 border-white/10 text-white rounded-xl px-5 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all text-sm placeholder:text-slate-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pass" className="text-[9px] font-bold uppercase text-slate-500 tracking-[0.2em] pl-1">
                  Chave de Acesso
                </Label>
                <div className="relative">
                  <Input 
                    id="pass"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-[#0F172A]/40 border-white/10 text-white rounded-xl px-5 pr-12 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all text-sm placeholder:text-slate-700"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#3B82F6] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit"
                  className="w-full h-12 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold tracking-widest transition-all shadow-xl shadow-[#3B82F6]/20 text-[10px]"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "AUTENTICAR"
                  )}
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-center gap-2 opacity-20 hover:opacity-40 transition-all cursor-default">
              <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-white">
                Ambiente Seguro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
