
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
 * Janela reduzida, layout horizontal responsivo.
 * Estética de branding aprimorada com melhor distribuição de elementos.
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
      {/* Janela Central (Ultra Compacta) */}
      <div className="w-full max-w-[420px] bg-[#1E293B] rounded-2xl overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] flex flex-col sm:flex-row animate-in fade-in zoom-in-95 duration-700">
        
        {/* Lado Esquerdo: Branding (Refinado) */}
        <div className="sm:w-1/3 bg-[#1E3A8A] p-6 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-white/5 relative overflow-hidden">
          {/* Sutil brilho decorativo de fundo */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 space-y-5">
            <div className="mx-auto w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl shadow-blue-500/20 transition-transform hover:scale-105 duration-300">
              <LayoutGrid className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block space-y-2">
              <h1 className="text-base font-headline font-bold text-white tracking-tight">NexusFlow</h1>
              <div className="flex items-center justify-center gap-1.5 opacity-30">
                <div className="h-[1px] w-3 bg-white" />
                <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-white">Gestão</p>
                <div className="h-[1px] w-3 bg-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Formulário (Focado) */}
        <div className="sm:w-2/3 p-8 bg-[#1E293B]">
          <div className="space-y-7">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">Acesso</h2>
              <p className="text-slate-400 text-[10px] font-medium leading-relaxed">Insira suas credenciais para gerenciar sua operação.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="py-2 px-3 rounded-lg border-none bg-red-900/30 text-red-400 text-[10px] animate-in slide-in-from-top-2">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <AlertDescription className="font-semibold ml-1">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] pl-1">
                    E-mail Corporativo
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="exemplo@nexusflow.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 bg-[#0F172A]/50 border-white/10 text-white rounded-xl px-4 focus:ring-[#3B82F6] transition-all text-[12px] placeholder:text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pass" className="text-[8px] font-bold uppercase text-slate-500 tracking-[0.2em] pl-1">
                    Senha de Acesso
                  </Label>
                  <div className="relative">
                    <Input 
                      id="pass"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 bg-[#0F172A]/50 border-white/10 text-white rounded-xl px-4 pr-11 focus:ring-[#3B82F6] transition-all text-[12px] placeholder:text-slate-700"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#3B82F6] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-11 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold tracking-[0.15em] transition-all shadow-lg shadow-[#3B82F6]/25 text-[10px] uppercase mt-2"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Entrar no NexusFlow"
                )}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-3 opacity-25 pt-2">
              <div className="h-[1px] w-8 bg-slate-500" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6]" />
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-white">
                  Acesso Seguro
                </span>
              </div>
              <div className="h-[1px] w-8 bg-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
