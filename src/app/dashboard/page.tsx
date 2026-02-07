"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  PieChart, 
  History 
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/lib/auth-store";

export default function Dashboard() {
  const { isAdmin } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-headline font-bold text-foreground mb-2 tracking-tight">Painel Operacional</h1>
          <p className="text-muted-foreground">Gestão estratégica e monitoramento em tempo real.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Receita de Hoje" 
            value="R$ 4.250,00" 
            icon={TrendingUp} 
            trend="+12% vs. ontem"
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard 
            title="Transações" 
            value="24" 
            icon={BarChart3} 
            trend="Ticket Médio: R$ 177,08"
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard 
            title="Total no Estoque" 
            value="1.248" 
            icon={Package} 
            trend="5 novas entradas hoje"
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard 
            title="Alertas Críticos" 
            value="12" 
            icon={AlertTriangle} 
            trend="Ação imediata recomendada"
            color="text-destructive"
            bgColor="bg-destructive/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="font-headline text-xl text-foreground">Fluxo Operacional Recente</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        #{1024 + i}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Operação Registrada</p>
                        <p className="text-xs text-muted-foreground">Há {i * 10} min • Concluído</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">R$ {i * 89},90</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm bg-card">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-center text-foreground">Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-3">
              <QuickAction icon={ShoppingCart} label="Frente de Caixa (PDV)" href="/pos" />
              <QuickAction icon={Package} label="Gestão de Estoque" href="/products" />
              {isAdmin && <QuickAction icon={PieChart} label="Inteligência de Dados" href="/reports" />}
              <QuickAction icon={History} label="Relatório Histórico" href="/history" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, bgColor }: any) {
  return (
    <Card className="border border-border shadow-sm overflow-hidden transition-all hover:shadow-md bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`${bgColor} ${color} p-3 rounded-xl`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold mb-1 tracking-tight text-foreground">{value}</h3>
          <p className="text-xs font-medium text-muted-foreground">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, href }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 p-4 border border-border rounded-xl hover:bg-primary hover:text-primary-foreground transition-all group">
      <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
      <span className="text-sm font-bold">{label}</span>
    </Link>
  );
}