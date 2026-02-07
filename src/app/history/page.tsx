
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar as CalendarIcon, Filter, Eye, Download, Loader2, Package, Trash2, AlertTriangle, CalendarDays } from "lucide-react";
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
  // Inicializar com a data local YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedDate) return null;
    
    // Consulta otimizada por data local exata (salva no novo campo localDate)
    // Se não encontrar por localDate (registros antigos), tentamos por prefixo no dateTime
    const startRange = `${selectedDate}T00:00:00.000Z`;
    const endRange = `${selectedDate}T23:59:59.999Z`;

    return query(
      collection(firestore, "users", user.uid, "sales"), 
      where("localDate", "==", selectedDate)
    );
  }, [firestore, user, selectedDate]);

  // Fallback para registros antigos que usavam apenas o formato ISO UTC no campo dateTime
  const legacySalesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedDate) return null;
    const startRange = `${selectedDate}T00:00:00.000Z`;
    const endRange = `${selectedDate}T23:59:59.999Z`;
    return query(
      collection(firestore, "users", user.uid, "sales"), 
      where("dateTime", ">=", startRange),
      where("dateTime", "<=", endRange)
    );
  }, [firestore, user, selectedDate]);

  const { data: sales, isLoading } = useCollection(salesQuery);
  const { data: legacySales, isLoading: isLoadingLegacy } = useCollection(legacySalesQuery);

  // Combinar e desduplicar resultados das duas consultas
  const combinedSales = [...(sales || []), ...(legacySales || [])]
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  // Filtro de pesquisa por ID ou por nome de produto dentro da lista carregada
  const filteredSales = combinedSales.filter(sale => {
    const matchesId = sale.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = sale.saleItems?.some((item: any) => 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesId || matchesProduct;
  });

  const handleDeleteDaySales = async () => {
    if (!firestore || !user || combinedSales.length === 0) return;
    
    setIsDeleting(true);
    const batch = writeBatch(firestore);
    
    try {
      combinedSales.forEach((sale) => {
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

  const formattedSelectedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-headline font-bold text-primary">Histórico de Vendas</h1>
            </div>
            <p className="text-muted-foreground">Vendas registradas em <span className="font-bold text-foreground">{formattedSelectedDate}</span></p>
          </div>
          <div className="flex gap-2">
            {isAdmin && combinedSales.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2 rounded-xl h-11" disabled={isDeleting}>
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Limpar registros do dia
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" /> Atenção: Ação Irreversível
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a excluir **todas as {combinedSales.length} vendas** registradas em {formattedSelectedDate}. Esta ação não pode ser desfeita e removerá os dados permanentemente.
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
            <Button variant="outline" className="gap-2 rounded-xl h-11">
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID da venda ou nome do produto..." 
              className="pl-10 h-12 rounded-xl shadow-sm border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input 
              type="date" 
              className="pl-10 h-12 rounded-xl border-primary/20 bg-primary/5 font-bold focus-visible:ring-primary shadow-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-none shadow-prominent overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            {(isLoading || isLoadingLegacy) && combinedSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Consultando base de dados...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="pl-6 h-14">Venda</TableHead>
                    <TableHead className="h-14">Produtos & Quantidades</TableHead>
                    <TableHead className="h-14">Horário</TableHead>
                    <TableHead className="h-14">Pagamento</TableHead>
                    <TableHead className="h-14">Total Geral</TableHead>
                    <TableHead className="text-right pr-6 h-14">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="group hover:bg-primary/[0.01] border-b border-border/40 transition-colors">
                      <TableCell className="pl-6 font-medium text-primary">
                        <span className="text-[10px] font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10 select-all">
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
                                <div key={`${sale.id}-${idx}`} className="flex items-center justify-between gap-4 p-2 rounded-xl bg-muted/5 group-hover:bg-white border border-transparent hover:border-border/40 transition-all shadow-sm">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="p-2 bg-primary/5 rounded-lg shrink-0">
                                      <Package className="h-4 w-4 text-primary opacity-70" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-bold leading-tight text-foreground truncate">
                                        {item.name || "Produto"}
                                      </span>
                                      <div className="flex gap-2 mt-0.5">
                                        <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1 border-muted text-muted-foreground">
                                          {item.brand || '-'}
                                        </Badge>
                                        <span className="text-[9px] text-muted-foreground/60 font-medium truncate">
                                          {item.model || '-'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-6 text-right shrink-0">
                                    <div className="flex flex-col items-end">
                                      <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest leading-none">Qtd</span>
                                      <span className="text-sm font-black text-foreground">{quantity}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-[8px] text-primary uppercase font-black tracking-widest leading-none">Subtotal</span>
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
                          <span className="font-black text-foreground text-base">
                            {new Date(sale.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-bold">
                            {new Date(sale.dateTime).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-[10px] uppercase bg-white border-border shadow-sm px-3 h-6">
                          {sale.paymentMethod === 'CARD' ? 'Cartão' : 
                           sale.paymentMethod === 'CASH' ? 'Dinheiro' : 
                           sale.paymentMethod === 'PIX' ? 'Pix' : sale.paymentMethod || '---'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-primary text-lg">
                        R$ {(Number(sale.totalAmount) || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl text-primary hover:bg-primary/10">
                          <Eye className="h-5 w-5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSales.length === 0 && !isLoading && !isLoadingLegacy && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-32 opacity-30">
                        <div className="flex flex-col items-center">
                          <Package className="h-20 w-20 mb-6" />
                          <p className="text-lg font-bold uppercase tracking-[0.2em]">Sem vendas em {formattedSelectedDate}</p>
                          <p className="text-sm mt-2 font-medium">Selecione outra data no calendário ou altere o termo de busca.</p>
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
