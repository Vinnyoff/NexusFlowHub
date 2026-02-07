
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Loader2, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "./lib/auth-store";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Lateral de Branding - Minimalista */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Efeito sutil de profundidade */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_white,transparent)]" />
        
        <div className="relative z-10 flex flex-col items-center gap-8 text-center animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <LayoutGrid className="h-20 w-20 text-white" />
          </div>
          <div className="space-y-3">
            <h1 className="text-7xl font-headline font-bold text-white tracking-tighter">NexusFlow</h1>
            <div className="h-1 w-12 bg-white/20 mx-auto rounded-full" />
            <p className="text-primary-foreground/40 font-bold tracking-[0.4em] uppercase text-[10px]">
              Gestão Empresarial Inteligente
            </p>
          </div>
        </div>
      </div>

      {/* Área de Login - Minimalista */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative z-20">
        <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-right-8 duration-1000">
          
          {/* Logo mobile simplificado */}
          <div className="lg:hidden flex flex-col items-center text-center mb-10">
            <LayoutGrid className="h-12 w-12 text-primary mb-2" />
            <h1 className="text-4xl font-headline font-bold text-foreground tracking-tighter">NexusFlow</h1>
          </div>

          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-foreground tracking-tight">Entrar</h3>
            <p className="text-muted-foreground/60 text-sm font-medium">Insira seus dados para acessar o painel.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <Alert variant="destructive" className="py-3 rounded-xl border-none bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-[0.2em]">
                Identificação / E-mail
              </Label>
              <Input 
                id="email"
                type="email" 
                placeholder="exemplo@nexusflow.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-none border-0 border-b border-border bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-primary transition-all text-base placeholder:text-muted-foreground/20"
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="pass" className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-[0.2em]">
                  Chave de Acesso
                </Label>
              </div>
              <div className="relative">
                <Input 
                  id="pass"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-none border-0 border-b border-border bg-transparent h-12 px-0 pr-10 focus-visible:ring-0 focus-visible:border-primary transition-all text-base placeholder:text-muted-foreground/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-6">
              <Button 
                type="submit"
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest transition-all shadow-2xl shadow-primary/20 text-xs"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "AUTENTICAR NO SISTEMA"
                )}
              </Button>
            </div>
          </form>
          
          <div className="flex flex-col items-center gap-10">
            <button type="button" className="text-[10px] font-bold text-muted-foreground/40 hover:text-primary uppercase tracking-widest transition-colors">
              Solicitar recuperação de acesso
            </button>

            <div className="flex items-center gap-3 opacity-20 grayscale">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground">
                Ambiente Seguro & Criptografado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
