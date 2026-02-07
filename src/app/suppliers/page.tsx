
"use client";

import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2, Building2, Pencil, Phone, Mail, MapPin, SearchCode } from "lucide-react";
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
  const [isFetchingCnpj, setIsFetchingCnpj] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastConsultedCnpj, setLastConsultedCnpj] = useState("");
  const [lastConsultedCep, setLastConsultedCep] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    fantasyName: "",
    cnpj: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zip: ""
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

  const fetchCnpjData = useCallback(async (cnpjToFetch?: string) => {
    const cnpj = cnpjToFetch || formData.cnpj;
    const cleanCnpj = cnpj.replace(/\D/g, "");
    
    if (cleanCnpj.length !== 14) return;
    if (cleanCnpj === lastConsultedCnpj) return;

    setIsFetchingCnpj(true);
    setLastConsultedCnpj(cleanCnpj);
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      if (!response.ok) throw new Error("Não foi possível localizar o CNPJ.");
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        name: data.razao_social || prev.name,
        fantasyName: data.nome_fantasia || prev.fantasyName,
        phone: data.ddd_telefone_1 || prev.phone,
        email: data.email || prev.email,
        street: data.logradouro || "",
        number: data.numero || "",
        complement: data.complemento || "",
        neighborhood: data.bairro || "",
        city: data.municipio || "",
        state: data.uf || "",
        zip: data.cep || ""
      }));

      toast({
        title: "Dados Recuperados",
        description: "Informações do fornecedor preenchidas automaticamente."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Consulta Automática",
        description: "Não foi possível carregar os dados deste CNPJ automaticamente."
      });
    } finally {
      setIsFetchingCnpj(false);
    }
  }, [formData.cnpj, lastConsultedCnpj, toast]);

  const fetchCepData = useCallback(async (cepToFetch?: string) => {
    const cep = cepToFetch || formData.zip;
    const cleanCep = cep.replace(/\D/g, "");
    
    if (cleanCep.length !== 8) return;
    if (cleanCep === lastConsultedCep) return;

    setIsFetchingCep(true);
    setLastConsultedCep(cleanCep);
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      if (!response.ok) throw new Error("Não foi possível localizar o CEP.");
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        street: data.street || prev.street,
        neighborhood: data.neighborhood || prev.neighborhood,
        city: data.city || prev.city,
        state: data.state || prev.state,
      }));

      toast({
        title: "Endereço Localizado",
        description: "Campos de localização preenchidos automaticamente."
      });
    } catch (error: any) {
      console.error(error);
      // Silenciosamente falha ou avisa se quiser
    } finally {
      setIsFetchingCep(false);
    }
  }, [formData.zip, lastConsultedCep, toast]);

  // Efeito para disparar a consulta automática de CNPJ ao atingir 14 dígitos
  useEffect(() => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, "");
    if (cleanCnpj.length === 14 && !isFetchingCnpj && cleanCnpj !== lastConsultedCnpj) {
      fetchCnpjData(cleanCnpj);
    }
  }, [formData.cnpj, isFetchingCnpj, lastConsultedCnpj, fetchCnpjData]);

  // Efeito para disparar a consulta automática de CEP ao atingir 8 dígitos
  useEffect(() => {
    const cleanCep = formData.zip.replace(/\D/g, "");
    if (cleanCep.length === 8 && !isFetchingCep && cleanCep !== lastConsultedCep) {
      fetchCepData(cleanCep);
    }
  }, [formData.zip, isFetchingCep, lastConsultedCep, fetchCepData]);

  const handleEdit = (supplier: any) => {
    setEditingId(supplier.id);
    const cleanCnpj = (supplier.cnpj || "").replace(/\D/g, "");
    const cleanCep = (supplier.zip || "").replace(/\D/g, "");
    setLastConsultedCnpj(cleanCnpj);
    setLastConsultedCep(cleanCep);
    setFormData({
      name: supplier.name || "",
      fantasyName: supplier.fantasyName || "",
      cnpj: supplier.cnpj || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      street: supplier.street || "",
      number: supplier.number || "",
      complement: supplier.complement || "",
      neighborhood: supplier.neighborhood || "",
      city: supplier.city || "",
      state: supplier.state || "",
      zip: supplier.zip || ""
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

    const fullAddress = `${formData.street}, ${formData.number}${formData.complement ? ' - ' + formData.complement : ''}, ${formData.neighborhood}, ${formData.city} - ${formData.state}, CEP: ${formData.zip}`;

    const supplierData: any = {
      name: formData.name,
      fantasyName: formData.fantasyName,
      cnpj: formData.cnpj,
      email: formData.email,
      phone: formData.phone,
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      address: fullAddress
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
    setLastConsultedCnpj("");
    setLastConsultedCep("");
    setFormData({ 
      name: "", 
      fantasyName: "", 
      cnpj: "", 
      email: "", 
      phone: "", 
      street: "", 
      number: "", 
      complement: "", 
      neighborhood: "", 
      city: "", 
      state: "", 
      zip: "" 
    });
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
            <DialogContent className="sm:max-w-[650px] rounded-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary">
                  {editingId ? "Editar Fornecedor" : "Novo Cadastro"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-6">
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between pl-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">CNPJ do Fornecedor</Label>
                    {isFetchingCnpj && (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-primary animate-pulse">
                        <Loader2 className="h-3 w-3 animate-spin" /> CONSULTANDO...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input 
                      placeholder="00.000.000/0000-00" 
                      value={formData.cnpj}
                      onChange={e => setFormData({...formData, cnpj: e.target.value})}
                      className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20 font-mono pr-12"
                    />
                    <div className="absolute right-3 top-3.5">
                      {isFetchingCnpj ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : (
                        <SearchCode className="h-5 w-5 text-muted-foreground opacity-30" />
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground italic px-1">A consulta é realizada automaticamente ao terminar de digitar.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Razão Social</Label>
                  <Input 
                    placeholder="Nexus Suprimentos LTDA" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Nome Fantasia</Label>
                  <Input 
                    placeholder="Nexus Distribuidora" 
                    value={formData.fantasyName}
                    onChange={e => setFormData({...formData, fantasyName: e.target.value})}
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

                <div className="border-t pt-4 md:col-span-2 flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Localização</span>
                </div>

                <div className="space-y-2 md:col-span-1">
                  <div className="flex items-center justify-between pl-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">CEP</Label>
                    {isFetchingCep && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                  </div>
                  <Input 
                    placeholder="00000-000" 
                    value={formData.zip}
                    onChange={e => setFormData({...formData, zip: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20 font-mono"
                  />
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">UF (Estado)</Label>
                  <Input 
                    placeholder="EX: SP" 
                    value={formData.state}
                    onChange={e => setFormData({...formData, state: e.target.value.toUpperCase().substring(0, 2)})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Logradouro (Rua)</Label>
                  <Input 
                    placeholder="Avenida Paulista" 
                    value={formData.street}
                    onChange={e => setFormData({...formData, street: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Número</Label>
                  <Input 
                    placeholder="123" 
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Complemento</Label>
                  <Input 
                    placeholder="Sala 101" 
                    value={formData.complement}
                    onChange={e => setFormData({...formData, complement: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Bairro</Label>
                  <Input 
                    placeholder="Centro" 
                    value={formData.neighborhood}
                    onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Cidade</Label>
                  <Input 
                    placeholder="São Paulo" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                  />
                </div>
              </div>

              <DialogFooter className="border-t border-border/50 pt-5 mt-2">
                <Button type="button" variant="ghost" className="rounded-xl h-11 px-6" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="button" className="rounded-xl h-11 px-8 bg-primary hover:bg-accent shadow-lg shadow-primary/20 font-bold" onClick={handleSaveSupplier} disabled={isFetchingCnpj || isFetchingCep}>
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
                    <TableHead className="h-14 text-[11px] uppercase tracking-widest font-bold">Localização</TableHead>
                    <TableHead className="text-right pr-6 h-14 text-[11px] uppercase tracking-widest font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/30">
                      <TableCell className="pl-6 py-4">
                        <div className="font-bold text-foreground text-sm">{supplier.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{supplier.fantasyName || 'Razão Social'}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          {supplier.phone && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone className="h-2.5 w-2.5" /> {supplier.phone}</span>}
                          {supplier.email && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Mail className="h-2.5 w-2.5" /> {supplier.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-mono text-[10px] bg-muted/30 border-none px-2 py-0.5">{supplier.cnpj}</Badge>
                      </TableCell>
                      <TableCell className="py-4 max-w-[250px]">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {supplier.address || `${supplier.city} - ${supplier.state}`}
                          </span>
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
