
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar as CalendarIcon, Filter, Eye, Download, Loader2, Package, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where, writeBatch, doc } from "firebase/firestore";
import { useAuth } from "@/app/lib/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SalesHistory() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedDate) return null;
    
    // Definir intervalo do dia selecionado
    const startOfDay = `${selectedDate}T00:00:00.000Z`;
    const endOfDay = `${selectedDate}T23:59:59.999Z`;

    return query(
      collection(firestore, "users", user.uid, "sales"), 
      where("dateTime", ">=", startOfDay),
      where("dateTime", "<=", endOfDay),
      orderBy("dateTime", "desc")
    );
  }, [firestore, user, selectedDate]);

  const { data: sales, isLoading } = useCollection(salesQuery);

  const filteredSales = sales?.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDeleteDaySales = async () => {
    if (!firestore || !user || !sales || sales.length === 0) return;
    
    setIsDeleting(true);
    const batch = writeBatch(firestore);
    
    try {
      sales.forEach((sale) => {
        const saleRef = doc(firestore, "users", user.uid, "sales", sale.id);
        batch.delete(saleRef);
      });
      
      await batch.commit();
      toast({
        title: "Histórico Excluído",
        description: `Todas as vendas do dia ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')} foram removidas.`,
      });
    } catch (error) {
      console.error("Erro ao excluir histórico:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível remover os registros selecionados.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Histórico de Vendas</h1>
            <p className="text-muted-foreground">Consulte e gerencie as transações do sistema.</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && sales && sales.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Limpar Dia
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> Atenção: Ação Irreversível
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a excluir **todas as {sales.length} vendas** registradas no dia {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteDaySales} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                      Confirmar Exclusão
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID da Venda..." 
              className="pl-10 h-12 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input 
              type="date" 
              className="pl-10 h-12 rounded-xl border-primary/20 bg-primary/5 font-bold"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Buscando transações...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6 h-14">Venda</TableHead>
                    <TableHead className="h-14">Produtos & Detalhes</TableHead>
                    <TableHead className="h-14">Horário</TableHead>
                    <TableHead className="h-14">Pagamento</TableHead>
                    <TableHead className="h-14">Total</TableHead>
                    <TableHead className="text-right pr-6 h-14">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales?.map((sale) => (
                    <TableRow key={sale.id} className="group hover:bg-primary/[0.02] border-b border-border/50">
                      <TableCell className="pl-6 font-medium text-primary">
                        <span className="text-[10px] font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10">
                          #{sale.id.substring(0, 8)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xl py-4">
                        <div className="space-y-2">
                          {sale.saleItems && Array.isArray(sale.saleItems) ? (
                            sale.saleItems.map((item: any, idx: number) => {
                              const price = Number(item.price) || 0;
                              const quantity = Number(item.quantity) || 0;
                              const subtotal = price * quantity;
                              
                              return (
                                <div key={`${sale.id}-${idx}`} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-muted/5 group-hover:bg-white/50 transition-colors border border-transparent hover:border-border/50">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="p-1.5 bg-primary/5 rounded-lg shrink-0">
                                      <Package className="h-3 w-3 text-primary opacity-60" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-xs font-bold leading-tight text-foreground truncate">
                                        {item.name || "Produto"}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight truncate">
                                        {item.brand || '-'} | {item.model || '-'}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-right shrink-0">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[9px] text-muted-foreground uppercase font-bold leading-none">Qtd</span>
                                      <span className="text-xs font-black text-foreground">{quantity}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[9px] text-primary uppercase font-bold leading-none">Subtotal</span>
                                      <span className="text-xs font-black text-primary">
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
                            {new Date(sale.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(sale.dateTime).toLocaleDateString('pt-BR')}
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
                  {(!filteredSales || filteredSales.length === 0) && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-32 opacity-30">
                        <div className="flex flex-col items-center">
                          <Package className="h-16 w-16 mb-4" />
                          <p className="text-sm font-bold uppercase tracking-widest">Nenhuma venda em {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                          <p className="text-xs mt-2">Selecione outra data no calendário para consultar.</p>
                        </div>
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
