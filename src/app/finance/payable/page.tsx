
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, ArrowDownCircle, Loader2, Calendar, CheckCircle, Trash2, Filter, Landmark, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AccountsPayable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    dueDate: "",
    entityName: "",
    category: "Mensalidade"
  });

  const firestore = useFirestore();
  const { toast } = useToast();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "financialTransactions"), where("type", "==", "PAYABLE"));
  }, [firestore]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  const filtered = transactions?.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.entityName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) || [];

  const handleSave = () => {
    if (!formData.description || !formData.amount || !formData.dueDate) return;
    
    const id = crypto.randomUUID();
    const docRef = doc(firestore!, "financialTransactions", id);
    setDocumentNonBlocking(docRef, {
      ...formData,
      id,
      type: "PAYABLE",
      amount: parseFloat(formData.amount),
      status: "PENDING",
      createdAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: "Conta registrada", description: "O compromisso foi adicionado com sucesso." });
    setIsDialogOpen(false);
    setFormData({ description: "", amount: "", dueDate: "", entityName: "", category: "Mensalidade" });
  };

  const markAsPaid = (id: string) => {
    const docRef = doc(firestore!, "financialTransactions", id);
    updateDocumentNonBlocking(docRef, { 
      status: "PAID", 
      paymentDate: new Date().toISOString() 
    });
    toast({ title: "Pagamento confirmado", description: "A conta foi marcada como paga." });
  };

  const deleteTransaction = (id: string) => {
    const docRef = doc(firestore!, "financialTransactions", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removido", description: "O registro foi excluído." });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-headline font-bold text-destructive flex items-center gap-2">
              <ArrowDownCircle className="h-8 w-8" /> Contas a Pagar
            </h1>
            <p className="text-muted-foreground">Gestão de obrigações, despesas fixas e fornecedores.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90 rounded-xl gap-2 h-11 px-6 shadow-lg shadow-destructive/20">
                <Plus className="h-5 w-5" /> Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Obrigação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição / Título</Label>
                  <Input 
                    placeholder="Ex: Aluguel Mensal ou Conta de Luz" 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria da Despesa</Label>
                  <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mensalidade">Mensalidade Fixa</SelectItem>
                      <SelectItem value="Utilidades">Utilidades (Água/Luz/Net)</SelectItem>
                      <SelectItem value="Mercadoria">Compra de Mercadoria</SelectItem>
                      <SelectItem value="Impostos">Impostos / Taxas</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Favorecido / Fornecedor (Opcional)</Label>
                  <Input 
                    placeholder="Nome da pessoa ou empresa" 
                    value={formData.entityName}
                    onChange={e => setFormData({...formData, entityName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input 
                      type="number" 
                      placeholder="0,00" 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vencimento</Label>
                    <Input 
                      type="date" 
                      value={formData.dueDate}
                      onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSave} className="w-full bg-destructive">Salvar Lançamento</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por descrição ou favorecido..." 
              className="pl-10 h-11 rounded-xl"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos os Status</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="PAID">Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-destructive" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Favorecido</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{t.description}</span>
                          {t.description.includes("NF") && (
                            <span className="text-[10px] text-muted-foreground font-mono">NF Automática</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/50 text-[10px] uppercase font-bold">
                          {t.category || "Geral"}
                        </Badge>
                      </TableCell>
                      <TableCell>{t.entityName || "---"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="h-3.5 w-3.5 opacity-50" />
                          {new Date(t.dueDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-destructive">R$ {t.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'PAID' ? 'secondary' : 'outline'} className={t.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 border-none' : 'border-destructive text-destructive'}>
                          {t.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {t.status === 'PENDING' && (
                            <Button size="icon" variant="ghost" className="text-emerald-500" onClick={() => markAsPaid(t.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteTransaction(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-muted-foreground opacity-30">
                        <Landmark className="h-12 w-12 mx-auto mb-2" />
                        Nenhuma conta registrada.
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
