
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
 * NexusFlow Login Page
 * 
 * Apresenta um layout moderno de tela dividida:
 * - Coluna Esquerda: Branding institucional com fundo azul sólido.
 * - Coluna Direita: Formulário de autenticação em ambiente dark, com inputs de alto contraste.
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

    // Tenta realizar a autenticação via AuthStore (Firebase)
    const result = await login(email, password);
    
    if (result.success) {
      // Redireciona para o dashboard em caso de sucesso
      router.push("/dashboard");
    } else {
      // Exibe erro amigável em caso de falha
      setError(result.message || "E-mail ou senha incorretos.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#0F172A]">
      {/* Coluna Esquerda: Branding Institucional (Visível apenas em Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1E3A8A] flex-col items-center justify-center p-12 text-white relative">
        {/* Elemento Decorativo Sutil */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white,transparent)]" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 text-center animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="p-5 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
            <LayoutGrid className="h-20 w-20 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-6xl font-headline font-bold text-white tracking-tighter">NexusFlow</h1>
            <div className="h-1 w-16 bg-white/30 mx-auto rounded-full" />
            <p className="text-blue-100/60 font-medium tracking-[0.2em] uppercase text-xs">
              Gestão Empresarial Inteligente
            </p>
          </div>
        </div>
      </div>

      {/* Coluna Direita: Área de Autenticação */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-[#0F172A] relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          
          {/* Logo mobile simplificado */}
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <LayoutGrid className="h-12 w-12 text-[#3B82F6] mb-2" />
            <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">NexusFlow</h1>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-4xl font-bold text-white tracking-tight">Entrar</h3>
            <p className="text-slate-400 font-medium">Acesse sua conta corporativa para gerenciar o fluxo.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="py-3 rounded-xl border-none bg-red-900/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">
                Identificação / E-mail
              </Label>
              <Input 
                id="email"
                type="email" 
                placeholder="exemplo@nexusflow.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all text-base placeholder:text-slate-600"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="pass" className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">
                  Chave de Acesso
                </Label>
                <button type="button" className="text-[10px] font-bold text-[#3B82F6] hover:underline uppercase tracking-wider">
                  Recuperar Senha
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="pass"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 bg-white/5 border-white/10 text-white rounded-2xl px-6 pr-12 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all text-base placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#3B82F6] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit"
                className="w-full h-14 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold tracking-widest transition-all shadow-xl shadow-[#3B82F6]/20 text-xs"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "AUTENTICAR NO SISTEMA"
                )}
              </Button>
            </div>
          </form>
          
          <div className="flex flex-col items-center gap-8 pt-6">
            <div className="flex items-center gap-3 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
              <ShieldCheck className="h-4 w-4 text-[#3B82F6]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Acesso Seguro & Criptografado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
