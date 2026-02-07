
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2, Building2, Pencil, Phone, Mail, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/app/lib/auth-store";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    fantasyName: "",
    cnpj: "",
    email: "",
    phone: ""
  });
  
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const suppliersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "suppliers");
  }, [firestore]);

  const { data: suppliers, isLoading } = useCollection(suppliersQuery);

  const filteredSuppliers = suppliers?.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.fantasyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cnpj?.includes(searchTerm)
  ) || [];

  const handleEdit = (supplier: any) => {
    setEditingId(supplier.id);
    setFormData({
      name: supplier.name || "",
      fantasyName: supplier.fantasyName || "",
      cnpj: supplier.cnpj || "",
      email: supplier.email || "",
      phone: supplier.phone || ""
    });
    setIsDialogOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!formData.name || !formData.cnpj) {
      toast({ 
        variant: "destructive", 
        title: "Campos obrigatórios", 
        description: "Preencha o nome e CNPJ do fornecedor." 
      });
      return;
    }

    const supplierData: any = {
      name: formData.name,
      fantasyName: formData.fantasyName,
      cnpj: formData.cnpj,
      email: formData.email,
      phone: formData.phone
    };

    if (editingId) {
      const docRef = doc(firestore!, "suppliers", editingId);
      updateDocumentNonBlocking(docRef, supplierData);
      toast({ title: "Sucesso", description: "Fornecedor atualizado." });
    } else {
      const supplierId = crypto.randomUUID();
      const docRef = doc(firestore!, "suppliers", supplierId);
      setDocumentNonBlocking(docRef, { ...supplierData, id: supplierId }, { merge: true });
      toast({ title: "Sucesso", description: "Fornecedor cadastrado." });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", fantasyName: "", cnpj: "", email: "", phone: "" });
  };

  const handleDelete = (id: string) => {
    if (!isAdmin || !firestore) return;
    const docRef = doc(firestore, "suppliers", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removido", description: "Fornecedor excluído." });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Gestão de Fornecedores</h1>
            <p className="text-muted-foreground">Administre sua rede de suprimentos e parceiros comerciais.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-primary hover:bg-accent text-white gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
                Cadastrar Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary">
                  {editingId ? "Editar Fornecedor" : "Novo Cadastro"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-5 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Razão Social</Label>
                  <Input 
                    placeholder="Ex: Nexus Suprimentos LTDA" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Nome Fantasia</Label>
                  <Input 
                    placeholder="Ex: Nexus Distribuidora" 
                    value={formData.fantasyName}
                    onChange={e => setFormData({...formData, fantasyName: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">CNPJ</Label>
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      value={formData.cnpj}
                      onChange={e => setFormData({...formData, cnpj: e.target.value})}
                      className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Telefone</Label>
                    <Input 
                      placeholder="(00) 0000-0000" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">E-mail</Label>
                  <Input 
                    type="email"
                    placeholder="contato@fornecedor.com" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-border/50 pt-5 mt-2">
                <Button type="button" variant="ghost" className="rounded-xl h-11 px-6" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="button" className="rounded-xl h-11 px-8 bg-primary hover:bg-accent shadow-lg shadow-primary/20 font-bold" onClick={handleSaveSupplier}>
                  {editingId ? "Salvar Alterações" : "Concluir Cadastro"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-prominent overflow-hidden rounded-2xl bg-card">
          <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Filtrar por nome, fantasia ou CNPJ..." 
                className="pl-12 h-12 rounded-xl border-none bg-muted/20 focus-visible:ring-primary/20 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Carregando parceiros...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="pl-6 h-14 text-[11px] uppercase tracking-widest font-bold">Fornecedor</TableHead>
                    <TableHead className="h-14 text-[11px] uppercase tracking-widest font-bold">Documento</TableHead>
                    <TableHead className="h-14 text-[11px] uppercase tracking-widest font-bold">Contato</TableHead>
                    <TableHead className="text-right pr-6 h-14 text-[11px] uppercase tracking-widest font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/30">
                      <TableCell className="pl-6 py-4">
                        <div className="font-bold text-foreground text-sm">{supplier.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{supplier.fantasyName || 'Razão Social'}</div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-mono text-[10px] bg-muted/30 border-none">{supplier.cnpj}</Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" /> {supplier.phone || '---'}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {supplier.email || '---'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-primary hover:bg-primary/10 rounded-lg"
                            onClick={() => handleEdit(supplier)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => handleDelete(supplier.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSuppliers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-32 opacity-30">
                        <Building2 className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Nenhum fornecedor localizado</p>
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
