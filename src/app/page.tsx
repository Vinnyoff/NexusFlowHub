"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shirt, ShieldCheck, User } from "lucide-react";
import { useAuth } from "./lib/auth-store";

export default function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleQuickLogin = async (targetEmail: string) => {
    setIsLoggingIn(true);
    await login(targetEmail, "password");
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-[320px] space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
            <Shirt className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold text-primary tracking-tight">FashionFlow</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Gestão Inteligente</p>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-md overflow-hidden rounded-3xl">
          <CardContent className="p-6 space-y-4">
            <p className="text-center text-[10px] font-bold uppercase text-muted-foreground mb-2">Selecione seu acesso</p>
            
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleQuickLogin("admin@fashionflow.com")}
                className="h-16 justify-start px-6 gap-4 border-primary/10 hover:bg-primary hover:text-white group transition-all rounded-2xl"
                disabled={isLoggingIn}
              >
                <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-white/20">
                  <ShieldCheck className="h-5 w-5 text-primary group-hover:text-white" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold">Administrador</span>
                  <span className="block text-[9px] opacity-60 uppercase">Acesso Total</span>
                </div>
              </Button>

              <Button 
                variant="outline" 
                onClick={() => handleQuickLogin("caixa@fashionflow.com")}
                className="h-16 justify-start px-6 gap-4 border-muted hover:bg-secondary group transition-all rounded-2xl"
                disabled={isLoggingIn}
              >
                <div className="bg-muted p-2 rounded-xl group-hover:bg-primary/10">
                  <User className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold">Operador</span>
                  <span className="block text-[9px] opacity-60 uppercase">Acesso PDV</span>
                </div>
              </Button>
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
