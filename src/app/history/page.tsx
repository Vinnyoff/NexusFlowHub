
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar as CalendarIcon, Filter, Eye, Download, Loader2, Package, Trash2, AlertTriangle, CalendarDays, ChevronDown, ChevronUp, PlusCircle, CreditCard, Banknote, QrCode, ListFilter, CalendarClock } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function SalesHistory() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set());
  
  const firestore = useFirestore();
  const { user } = useUser();
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const salesQuery = useMemoFirebase(() => {
    if (!firestore || !user || !selectedDate) return null;
    return query(
      collection(firestore, "users", user.uid, "sales"), 
      where("localDate", "==", selectedDate)
    );
  }, [firestore, user, selectedDate]);

  const { data: sales, isLoading } = useCollection(salesQuery);

  const combinedSales = (sales || [])
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const filteredSales = combinedSales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.saleItems?.some((item: any) => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesPayment = paymentFilter === "ALL" || sale.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesPayment;
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

  const toggleSaleExpansion = (id: string) => {
    const newExpanded = new Set(expandedSales);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSales(newExpanded);
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
                      Você está prestes a excluir **todas as {combinedSales.length} vendas** registradas em {formattedSelectedDate}. Esta ação não pode ser desfeita.
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

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por ID ou produto..." 
              className="pl-10 h-12 rounded-xl shadow-sm border-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative md:col-span-4">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-12 rounded-xl border-muted bg-card shadow-sm pl-10">
                <Filter className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
                <SelectValue placeholder="Forma de Pagamento" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Todos os Pagamentos</SelectItem>
                <SelectItem value="CARD">Cartão</SelectItem>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="PIX">Pix</SelectItem>
                <SelectItem value="DEFERRED">A Prazo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative md:col-span-3">
            <CalendarIcon className="absolute left-3 top-3.5 h-4 w-4 text-primary" />
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
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Consultando base de dados...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="pl-6 h-14">Venda</TableHead>
                    <TableHead className="h-14">Itens Vendidos</TableHead>
                    <TableHead className="h-14">Horário</TableHead>
                    <TableHead className="h-14">Pagamento</TableHead>
                    <TableHead className="h-14">Total Geral</TableHead>
                    <TableHead className="text-right pr-6 h-14">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const isExpanded = expandedSales.has(sale.id);
                    const totalItems = sale.saleItems?.length || 0;
                    const itemsToShow = isExpanded ? sale.saleItems : (sale.saleItems?.slice(0, 1) || []);

                    return (
                      <TableRow key={sale.id} className="group hover:bg-primary/[0.01] border-b border-border/40 transition-colors">
                        <TableCell className="pl-6 font-medium text-primary">
                          <span className="text-[10px] font-mono bg-primary/5 px-2 py-1 rounded border border-primary/10 select-all">
                            #{sale.id.substring(0, 8)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-2xl py-4">
                          <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-[10px] font-black uppercase text-muted-foreground mb-1 px-2">
                              <div className="col-span-5">Produto</div>
                              <div className="col-span-2 text-center">Qtd</div>
                              <div className="col-span-2 text-right">Valor Unit.</div>
                              <div className="col-span-3 text-right">Subtotal</div>
                            </div>
                            
                            {itemsToShow.map((item: any, idx: number) => {
                              const price = Number(item.price) || 0;
                              const quantity = Number(item.quantity) || 0;
                              const subtotal = price * quantity;
                              
                              return (
                                <div key={`${sale.id}-${idx}`} className="grid grid-cols-12 items-center gap-2 p-2 rounded-xl bg-muted/5 group-hover:bg-white border border-transparent hover:border-border/40 transition-all shadow-sm">
                                  <div className="col-span-5 flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-foreground truncate">{item.name || "Produto"}</span>
                                    <span className="text-[9px] text-muted-foreground truncate">{item.brand} | {item.model}</span>
                                  </div>
                                  <div className="col-span-2 text-center">
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-[11px] font-black">{quantity}</Badge>
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span className="text-[11px] font-medium text-muted-foreground">R$ {price.toFixed(2)}</span>
                                  </div>
                                  <div className="col-span-3 text-right">
                                    <span className="text-sm font-black text-primary">R$ {subtotal.toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })}

                            {!isExpanded && totalItems > 1 && (
                              <div className="pl-2">
                                <span className="text-[10px] text-muted-foreground italic font-medium">
                                  + {totalItems - 1} outros produtos neste lote...
                                </span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-black text-foreground text-base">
                              {new Date(sale.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-bold text-[10px] uppercase bg-white border-border shadow-sm px-3 h-6 flex items-center gap-1.5">
                            {sale.paymentMethod === 'CARD' ? <><CreditCard className="h-3 w-3" /> Cartão</> : 
                             sale.paymentMethod === 'CASH' ? <><Banknote className="h-3 w-3" /> Dinheiro</> : 
                             sale.paymentMethod === 'PIX' ? <><QrCode className="h-3 w-3" /> Pix</> : 
                             sale.paymentMethod === 'DEFERRED' ? <><CalendarClock className="h-3 w-3" /> A Prazo</> : 
                             sale.paymentMethod || '---'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-black text-primary text-lg">
                          R$ {(Number(sale.totalAmount) || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {totalItems > 1 && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleSaleExpansion(sale.id)}
                                className={cn(
                                  "h-9 px-4 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl transition-all shadow-sm",
                                  isExpanded 
                                    ? "bg-muted text-muted-foreground border-muted" 
                                    : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                                )}
                              >
                                {isExpanded ? (
                                  <><ChevronUp className="h-3.5 w-3.5" /> Recolher</>
                                ) : (
                                  <><ChevronDown className="h-3.5 w-3.5" /> Ver Itens ({totalItems})</>
                                )}
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-9 w-9 p-0 rounded-xl text-primary hover:bg-primary/10">
                              <Eye className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredSales.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-32 opacity-30">
                        <div className="flex flex-col items-center">
                          <Package className="h-20 w-20 mb-6" />
                          <p className="text-lg font-bold uppercase tracking-[0.2em]">Sem vendas filtradas</p>
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
