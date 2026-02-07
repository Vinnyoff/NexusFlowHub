"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LayoutGrid, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
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
    <div className="flex items-center justify-center h-screen w-screen overflow-hidden bg-background p-4">
      <div className="w-full max-w-[380px] space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-card p-3 rounded-2xl shadow-xl border border-border">
            <LayoutGrid className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground tracking-tight">NexusFlow</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em]">
              Gestão Empresarial
            </p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card rounded-3xl overflow-hidden">
          <CardContent className="p-8 pt-10">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="py-2 px-3 rounded-xl border-none bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase text-muted-foreground ml-1">
                  E-mail Corporativo
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="exemplo@nexusflow.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-border bg-background h-12 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pass" className="text-[11px] font-bold uppercase text-muted-foreground ml-1">
                  Senha de Acesso
                </Label>
                <div className="relative">
                  <Input 
                    id="pass"
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-border bg-background h-12 focus:ring-primary/20 transition-all pr-10"
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
                className="w-full h-12 rounded-xl bg-primary hover:bg-accent text-primary-foreground font-bold tracking-wide transition-all shadow-lg shadow-primary/20 mt-2"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "ENTRAR NO NEXUSFLOW"
                )}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">
                Acesso Seguro Verificado
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
          &copy; 2024 NexusFlow Systems
        </p>
      </div>
    </div>
  );
}