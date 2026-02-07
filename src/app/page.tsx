"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shirt, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "./lib/auth-store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, loginWithGoogle } = useAuth();
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

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoggingIn(true);
    const result = await loginWithGoogle();
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-[350px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
            <Shirt className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">FashionFlow</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">
              Sistema de Gestão
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden rounded-3xl">
          <CardContent className="p-6 pt-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2 px-3 rounded-xl border-none bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  E-mail
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="seu@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-primary/10 h-11 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="pass" className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                  Senha
                </Label>
                <div className="relative">
                  <Input 
                    id="pass"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-primary/10 h-11 focus:ring-primary/20 transition-all pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-11 rounded-xl bg-primary hover:bg-accent font-bold tracking-wide transition-all shadow-lg shadow-primary/20 mt-2"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "ENTRAR"
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-bold">Ou continue com</span>
              </div>
            </div>

            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full h-11 rounded-xl border-primary/20 hover:bg-primary/5 font-bold tracking-wide transition-all"
              disabled={isLoggingIn}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              GOOGLE
            </Button>
            
            <div className="mt-6 pt-6 border-t border-border/50 text-center">
              <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                Acesso verificado para ADM ou Caixa
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
          &copy; 2024 FashionFlow Studio
        </p>
      </div>
    </div>
  );
}
