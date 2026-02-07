
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter, Eye, Download, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";

export default function SalesHistory() {
  const firestore = useFirestore();
  const { user } = useUser();

  // Busca de produtos para resolver nomes e detalhes no histórico
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: products } = useCollection(productsQuery);

  // Busca de vendas ordenadas por data (mais recente primeiro)
  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "sales"), orderBy("dateTime", "desc"));
  }, [firestore, user]);

  const { data: sales, isLoading } = useCollection(salesQuery);

  // Função auxiliar para encontrar detalhes do produto pelo ID
  const getProductDetails = (productId: string) => {
    return products?.find(p => p.id === productId);
  };

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

        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6 h-14">ID Venda</TableHead>
                    <TableHead className="h-14">Produtos</TableHead>
                    <TableHead className="h-14">Data e Hora</TableHead>
                    <TableHead className="h-14">Pagamento</TableHead>
                    <TableHead className="h-14">Valor Total</TableHead>
                    <TableHead className="text-right pr-6 h-14">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales?.map((sale) => (
                    <TableRow key={sale.id} className="group hover:bg-primary/[0.02]">
                      <TableCell className="pl-6 font-medium text-primary">
                        <span className="text-xs font-mono bg-primary/5 px-2 py-1 rounded">
                          #{sale.id.substring(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-md py-4">
                        <div className="space-y-3">
                          {sale.saleItems?.map((productId: string, idx: number) => {
                            const product = getProductDetails(productId);
                            return (
                              <div key={`${sale.id}-${productId}-${idx}`} className="flex items-start gap-2">
                                <div className="p-1.5 bg-muted rounded-lg shrink-0">
                                  <Package className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold leading-none">
                                    {product?.name || "Produto não localizado"}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground uppercase mt-1">
                                    {product?.brand || '-'} | {product?.model || '-'}
                                  </span>
                                  {product?.category && (
                                    <Badge variant="secondary" className="w-fit mt-1 text-[8px] h-4 px-1 py-0 font-bold uppercase border-none bg-muted/50">
                                      {product.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(sale.dateTime).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-[10px] uppercase bg-white">
                          {sale.paymentMethod === 'CARD' ? 'Cartão' : 
                           sale.paymentMethod === 'CASH' ? 'Dinheiro' : 
                           sale.paymentMethod === 'PIX' ? 'Pix' : sale.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-primary">
                        R$ {sale.totalAmount?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-2 text-primary hover:bg-primary/10">
                          <Eye className="h-4 w-4" /> Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sales?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-32 opacity-30">
                        <Package className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Nenhuma venda registrada</p>
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
