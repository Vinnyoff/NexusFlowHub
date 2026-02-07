
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
      {/* Lateral de Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/20" />
        
        {/* Elementos Decorativos de Fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-black/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
            <LayoutGrid className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">NexusFlow</h1>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <h2 className="text-5xl font-headline font-bold text-white leading-tight">
            Gestão Inteligente para o seu Negócio.
          </h2>
          <p className="text-lg text-primary-foreground/80 leading-relaxed">
            Potencialize suas operações com nossa plataforma integrada de estoque, vendas e análise de dados.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-primary-foreground/60 text-xs font-bold uppercase tracking-widest">
          <span>&copy; 2024 NexusFlow Systems</span>
          <span className="h-1 w-1 bg-current rounded-full" />
          <span>Segurança Enterprise</span>
        </div>
      </div>

      {/* Área de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-card shadow-2xl relative z-20">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <LayoutGrid className="h-10 w-10 text-primary mb-2" />
            <h1 className="text-3xl font-headline font-bold text-foreground">NexusFlow</h1>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-headline font-bold text-foreground tracking-tight">Acesse sua conta</h3>
            <p className="text-muted-foreground text-sm">Insira suas credenciais corporativas abaixo.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="py-3 rounded-xl border-none bg-destructive/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                E-mail Corporativo
              </Label>
              <Input 
                id="email"
                type="email" 
                placeholder="nome@empresa.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-border bg-background h-12 focus:ring-primary/20 transition-all text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="pass" className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Senha de Acesso
                </Label>
                <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase">
                  Esqueci a senha
                </button>
              </div>
              <div className="relative">
                <Input 
                  id="pass"
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border-border bg-background h-12 focus:ring-primary/20 transition-all pr-12 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit"
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide transition-all shadow-xl shadow-primary/20"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "ENTRAR NO SISTEMA"
              )}
            </Button>
          </form>
          
          <div className="pt-8 border-t border-border flex items-center justify-center gap-2 opacity-50">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Acesso Criptografado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
