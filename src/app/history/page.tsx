
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SalesHistory() {
  const mockSales = [
    { id: "1028", date: "24/05/2024 14:32", cashier: "Caixa 01", items: 3, total: 189.90, method: "Cartão" },
    { id: "1027", date: "24/05/2024 14:15", cashier: "Admin", items: 1, total: 49.90, method: "Dinheiro" },
    { id: "1026", date: "24/05/2024 13:58", cashier: "Caixa 01", items: 2, total: 548.00, method: "Pix" },
    { id: "1025", date: "24/05/2024 13:22", cashier: "Caixa 01", items: 1, total: 299.00, method: "Cartão" },
    { id: "1024", date: "23/05/2024 18:45", cashier: "Admin", items: 5, total: 1240.50, method: "Cartão" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Histórico de Vendas</h1>
            <p className="text-muted-foreground">Consulte todas as transações realizadas no sistema.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Exportar Relatório
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por ID ou Vendedor" className="pl-10" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input type="date" className="pl-10" />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="h-4 w-4" /> Filtrar Resultados
          </Button>
        </div>

        <Card className="border-none shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">ID Venda</TableHead>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="text-right pr-6">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="pl-6 font-medium text-primary">#{sale.id}</TableCell>
                    <TableCell>{sale.date}</TableCell>
                    <TableCell>{sale.cashier}</TableCell>
                    <TableCell>{sale.items} produtos</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sale.method}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">R$ {sale.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="sm" className="gap-2 text-primary">
                        <Eye className="h-4 w-4" /> Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
