
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

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "sales"), orderBy("dateTime", "desc"));
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
                    <TableHead className="pl-6 h-14">Venda</TableHead>
                    <TableHead className="h-14">Produtos & Detalhes</TableHead>
                    <TableHead className="h-14">Data</TableHead>
                    <TableHead className="h-14">Pagamento</TableHead>
                    <TableHead className="h-14">Total Venda</TableHead>
                    <TableHead className="text-right pr-6 h-14">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales?.map((sale) => (
                    <TableRow key={sale.id} className="group hover:bg-primary/[0.02] border-b border-border/50">
                      <TableCell className="pl-6 font-medium text-primary">
                        <span className="text-[10px] font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10">
                          #{sale.id.substring(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-2xl py-4">
                        <div className="space-y-3">
                          {sale.saleItems && Array.isArray(sale.saleItems) ? (
                            sale.saleItems.map((item: any, idx: number) => {
                              const price = Number(item.price) || 0;
                              const quantity = Number(item.quantity) || 0;
                              const subtotal = price * quantity;
                              
                              return (
                                <div key={`${sale.id}-${idx}`} className="flex items-center justify-between gap-6 p-2 rounded-lg bg-muted/5 group-hover:bg-white/50 transition-colors border border-transparent hover:border-border/50">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="p-2 bg-primary/5 rounded-xl shrink-0">
                                      <Package className="h-4 w-4 text-primary opacity-60" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-bold leading-tight text-foreground truncate">
                                        {item.name || "Produto"}
                                      </span>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight truncate">
                                          {item.brand || '-'} | {item.model || '-'}
                                        </span>
                                        <Badge variant="secondary" className="text-[8px] h-4 px-1 py-0 font-bold uppercase bg-muted/30 text-muted-foreground border-none">
                                          {item.category || "Geral"}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 text-right shrink-0">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Qtd</span>
                                      <span className="text-sm font-black text-foreground">{quantity}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Unit.</span>
                                      <span className="text-xs font-medium">R$ {price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[10px] text-primary uppercase font-bold">Subtotal</span>
                                      <span className="text-sm font-black text-primary">
                                        R$ {subtotal.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Detalhes não disponíveis</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">
                            {new Date(sale.dateTime).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(sale.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-[9px] uppercase bg-white border-border shadow-sm px-2">
                          {sale.paymentMethod === 'CARD' ? 'Cartão' : 
                           sale.paymentMethod === 'CASH' ? 'Dinheiro' : 
                           sale.paymentMethod === 'PIX' ? 'Pix' : sale.paymentMethod || '---'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-primary text-base">
                        R$ {(Number(sale.totalAmount) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl text-primary hover:bg-primary/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!sales || sales.length === 0) && !isLoading && (
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
