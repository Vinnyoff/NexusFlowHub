
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter, Eye, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";

export default function SalesHistory() {
  const { firestore } = useFirestore();
  const { user } = useUser();

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "users", user.uid, "sales");
  }, [firestore, user]);

  const { data: sales, isLoading } = useCollection(salesQuery);

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
            <Input placeholder="Buscar por ID" className="pl-10" />
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
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">ID Venda</TableHead>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales?.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="pl-6 font-medium text-primary">
                        #{sale.id.substring(0, 8)}
                      </TableCell>
                      <TableCell>{new Date(sale.dateTime).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">R$ {sale.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="gap-2 text-primary">
                          <Eye className="h-4 w-4" /> Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sales?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                        Nenhuma venda registrada ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
