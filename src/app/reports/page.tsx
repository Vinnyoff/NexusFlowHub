
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertCircle, ShoppingCart, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { generateRestockSuggestions } from "@/ai/flows/ai-restock-suggestions";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  total: {
    label: "Faturamento",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function ReportsPage() {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);

  const salesData = [
    { name: "Seg", total: 1200 },
    { name: "Ter", total: 900 },
    { name: "Qua", total: 1600 },
    { name: "Qui", total: 1100 },
    { name: "Sex", total: 2400 },
    { name: "Sab", total: 3200 },
    { name: "Dom", total: 2100 },
  ];

  const topProducts = [
    { name: "Camiseta Basic", sales: 85, color: "hsl(var(--primary))" },
    { name: "Calça Jeans Slim", sales: 62, color: "hsl(var(--chart-2))" },
    { name: "Meias Algodão", sales: 45, color: "hsl(var(--chart-3))" },
    { name: "Jaqueta Couro", sales: 12, color: "hsl(var(--chart-4))" },
  ];

  const handleAiSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const input = {
        salesHistory: "Camiseta Basic (M): 40 sold last week. Calça Jeans Slim (42): 15 sold last week. Jaqueta Couro (P): 1 sold last week.",
        stockLevels: "Camiseta Basic (M): 5 items. Calça Jeans Slim (42): 2 items. Jaqueta Couro (P): 12 items."
      };
      const result = await generateRestockSuggestions(input);
      setAiSuggestions(result.restockSuggestions);
    } catch (error) {
      console.error("AI flow error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Relatórios e Inteligência</h1>
            <p className="text-muted-foreground">Analise o desempenho da loja e previsões de estoque.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="font-headline flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" /> Faturamento Semanal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px] w-full">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Sugestões AI FashionFlow
              </CardTitle>
              <CardDescription>Otimização de estoque baseada em tendências.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiSuggestions ? (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <p className="text-sm font-medium mb-3">Recomendações de Reposição:</p>
                  <div className="space-y-2">
                    {aiSuggestions.split(',').map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white rounded border border-primary/10">
                        <span className="font-semibold">{item.split(':')[0]}</span>
                        <Badge className="bg-primary">{item.split(':')[1]} un</Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4 text-xs h-8" onClick={() => setAiSuggestions(null)}>Limpar</Button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                    <Sparkles className="h-8 w-8 text-primary opacity-40" />
                  </div>
                  <p className="text-sm text-muted-foreground px-4 italic">
                    Nossa IA analisa seu histórico para sugerir as quantidades ideais de reposição.
                  </p>
                  <Button onClick={handleAiSuggestions} disabled={isAiLoading} className="w-full bg-primary hover:bg-accent text-white gap-2">
                    {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Gerar Sugestões
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline">Mais Vendidos por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {topProducts.map((p, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground font-bold">{p.sales} un</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(p.sales / 100) * 100}%`, backgroundColor: p.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Alerta de Estoque Crítico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Calça Jeans Slim (42)</p>
                      <p className="text-xs text-muted-foreground">Restam apenas 2 unidades</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Repor</Button>
                </div>
                <div className="p-3 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Camiseta Basic (M)</p>
                      <p className="text-xs text-muted-foreground">Restam apenas 5 unidades</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Repor</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
