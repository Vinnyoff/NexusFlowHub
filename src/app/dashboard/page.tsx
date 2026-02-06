
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  PieChart, 
  History 
} from "lucide-react";

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary mb-2">Bem-vindo à FashionFlow</h1>
          <p className="text-muted-foreground">Aqui está o resumo do que está acontecendo hoje.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Vendas Hoje" 
            value="R$ 4.250,00" 
            icon={TrendingUp} 
            trend="+12% em relação a ontem"
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <StatCard 
            title="Pedidos Realizados" 
            value="24" 
            icon={ShoppingBag} 
            trend="Média de R$ 177,00 por venda"
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard 
            title="Total de Produtos" 
            value="1.248" 
            icon={Package} 
            trend="5 variações cadastradas hoje"
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard 
            title="Estoque Baixo" 
            value="12 itens" 
            icon={AlertTriangle} 
            trend="Atenção necessária"
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Vendas Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        V
                      </div>
                      <div>
                        <p className="font-medium">Venda #{1024 + i}</p>
                        <p className="text-xs text-muted-foreground">Há {i * 10} minutos • Caixa 01</p>
                      </div>
                    </div>
                    <span className="font-bold text-primary">R$ {i * 89},90</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <QuickAction icon={ShoppingCart} label="Novo Pedido" href="/pos" />
              <QuickAction icon={Package} label="Cadastrar Produto" href="/products" />
              <QuickAction icon={PieChart} label="Ver Relatórios" href="/reports" />
              <QuickAction icon={History} label="Histórico de Vendas" href="/history" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, bgColor }: any) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`${bgColor} ${color} p-3 rounded-xl`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1 font-medium">{title}</p>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
          <p className="text-xs font-medium text-muted-foreground">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, href }: any) {
  return (
    <a href={href} className="flex flex-col items-center justify-center p-6 border rounded-2xl hover:bg-primary/5 hover:border-primary transition-all group text-center">
      <Icon className="h-8 w-8 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
      <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">{label}</span>
    </a>
  );
}
