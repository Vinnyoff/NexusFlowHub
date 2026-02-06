
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shirt } from "lucide-react";
import { AuthProvider } from "./lib/auth-store";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-[380px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-primary p-4 rounded-2xl shadow-xl shadow-primary/20">
            <Shirt className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-primary tracking-tight">FashionFlow</h1>
            <p className="text-sm text-muted-foreground font-medium">Gestão inteligente para sua boutique</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider font-bold opacity-70">Acesso</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@fashionflow.com"
                  className="bg-background/50 border-muted"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" title="Senha" className="text-xs uppercase tracking-wider font-bold opacity-70">Segurança</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-background/50 border-muted"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground font-medium">
          &copy; 2024 FashionFlow Studio
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}
