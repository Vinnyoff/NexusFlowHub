
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2, Package, Layers, Barcode as BarcodeIcon, Sparkles, Pencil, ScanBarcode, ClipboardList, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/app/lib/auth-store";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function ProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("principal");
  
  // Filtros individuais por coluna
  const [filters, setFilters] = useState({
    name: "",
    internalCode: "",
    barcode: "",
    ncm: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    stock: "",
    variant: "Padrão",
    category: "Geral",
    barcode: "",
    internalCode: "",
    ncm: ""
  });
  
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => {
    const matchesName = (p.name?.toLowerCase().includes(filters.name.toLowerCase()) || p.brand?.toLowerCase().includes(filters.name.toLowerCase()));
    const matchesInternal = p.internalCode?.toLowerCase().includes(filters.internalCode.toLowerCase());
    const matchesBarcode = p.barcode?.toLowerCase().includes(filters.barcode.toLowerCase());
    const matchesNcm = p.ncm?.toLowerCase().includes(filters.ncm.toLowerCase());
    
    return matchesName && matchesInternal && matchesBarcode && matchesNcm;
  }) || [];

  const calculateEAN8CheckDigit = (code: string) => {
    let sum = 0;
    const weights = [3, 1, 3, 1, 3, 1, 3];
    for (let i = 0; i < 7; i++) {
      sum += parseInt(code[i]) * weights[i];
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  };

  const handleGenerateInternalCode = () => {
    const base = `${Math.floor(1000000 + Math.random() * 9000000)}`;
    const checkDigit = calculateEAN8CheckDigit(base);
    const fullCode = base + checkDigit;
    
    setFormData({ ...formData, internalCode: fullCode });
    toast({ title: "Código Interno Gerado", description: `EAN-8: ${fullCode}` });
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      model: product.model || "",
      price: product.price?.toString() || "",
      stock: product.quantity?.toString() || "",
      variant: product.size || "Padrão",
      category: product.category || "Geral",
      barcode: product.barcode || "",
      internalCode: product.internalCode || "",
      ncm: product.ncm || ""
    });
    setIsDialogOpen(true);
    setActiveTab("principal");
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      toast({ 
        variant: "destructive", 
        title: "Campos obrigatórios", 
        description: "Preencha o nome e preço do produto." 
      });
      return;
    }

    if (!isAdmin) {
      toast({ variant: "destructive", title: "Erro", description: "Apenas administradores podem gerenciar estoque." });
      return;
    }

    let finalInternalCode = formData.internalCode;
    if (!finalInternalCode) {
      const base = `${Math.floor(1000000 + Math.random() * 9000000)}`;
      finalInternalCode = base + calculateEAN8CheckDigit(base);
    }

    const productData: any = {
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      category: formData.category || "Geral",
      size: formData.variant,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.stock) || 0,
      barcode: formData.barcode || "",
      internalCode: finalInternalCode,
      ncm: formData.ncm || ""
    };

    if (editingId) {
      const docRef = doc(firestore!, "products", editingId);
      updateDocumentNonBlocking(docRef, productData);
      toast({ title: "Sucesso", description: "Produto atualizado." });
    } else {
      const productId = crypto.randomUUID();
      const docRef = doc(firestore!, "products", productId);
      setDocumentNonBlocking(docRef, { ...productData, id: productId }, { merge: true });
      toast({ 
        title: "Sucesso", 
        description: `Produto cadastrado. Código Interno: ${finalInternalCode}` 
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      name: "", 
      brand: "", 
      model: "", 
      price: "", 
      stock: "", 
      variant: "Padrão",
      category: "Geral",
      barcode: "",
      internalCode: "",
      ncm: ""
    });
  };

  const handleDelete = (id: string) => {
    if (!isAdmin || !firestore) return;
    const docRef = doc(firestore, "products", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removido", description: "Item excluído." });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Gestão de Estoque</h1>
            <p className="text-muted-foreground">Administre seu inventário com códigos internos e fiscais (NCM).</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-primary hover:bg-accent text-white gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
                Cadastrar Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl text-primary">
                  {editingId ? "Editar Produto" : "Novo Cadastro"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="principal" value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1.5 rounded-xl">
                  <TabsTrigger value="principal" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">
                    <Layers className="h-4 w-4 mr-2" /> Identificação
                  </TabsTrigger>
                  <TabsTrigger value="detalhes" className="rounded-lg font-bold text-[11px] uppercase tracking-wider">
                    <ScanBarcode className="h-4 w-4 mr-2" /> Códigos / Fiscal
                  </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-2 gap-5 py-6">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Nome do Item</Label>
                    <Input 
                      placeholder="Ex: Camiseta de Algodão Premium" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                    />
                  </div>
                  
                  <TabsContent value="principal" className="col-span-2 m-0 grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Fabricante</Label>
                      <Input 
                        placeholder="Ex: Nike" 
                        value={formData.brand}
                        onChange={e => setFormData({...formData, brand: e.target.value})}
                        className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Categoria</Label>
                      <Input 
                        placeholder="Ex: Vestuário" 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Preço Venda (R$)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20 font-bold text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Qtd em Estoque</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: e.target.value})}
                        className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="detalhes" className="col-span-2 m-0 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Cód. Barras (EAN-13)</Label>
                        <div className="relative">
                          <BarcodeIcon className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Escaneie..." 
                            value={formData.barcode}
                            onChange={e => setFormData({...formData, barcode: e.target.value})}
                            className="rounded-xl border-primary/10 h-12 pl-10 text-sm bg-muted/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Fiscal (NCM)</Label>
                        <div className="relative">
                          <ClipboardList className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="00000000" 
                            value={formData.ncm}
                            onChange={e => setFormData({...formData, ncm: e.target.value})}
                            className="rounded-xl border-primary/10 h-12 pl-10 text-sm bg-muted/20 font-mono"
                            maxLength={8}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Código Interno de Etiqueta (EAN-8)</Label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Gerado automaticamente..." 
                          value={formData.internalCode}
                          onChange={e => setFormData({...formData, internalCode: e.target.value})}
                          className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20 font-mono"
                          maxLength={8}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-12 rounded-xl border-dashed gap-2 text-xs"
                          onClick={handleGenerateInternalCode}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          Gerar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Modelo / SKU</Label>
                        <Input 
                          placeholder="Ex: MOD-2024" 
                          value={formData.model}
                          onChange={e => setFormData({...formData, model: e.target.value})}
                          className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Tamanho / Var</Label>
                        <Input 
                          placeholder="Ex: M" 
                          value={formData.variant}
                          onChange={e => setFormData({...formData, variant: e.target.value})}
                          className="rounded-xl border-primary/10 h-12 text-sm bg-muted/20"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="border-t border-border/50 pt-5 mt-2">
                <Button type="button" variant="ghost" className="rounded-xl h-11 px-6" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="button" className="rounded-xl h-11 px-8 bg-primary hover:bg-accent shadow-lg shadow-primary/20 font-bold" onClick={handleSaveProduct}>
                  {editingId ? "Salvar Alterações" : "Concluir Cadastro"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-prominent overflow-hidden rounded-2xl bg-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">Sincronizando inventário...</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-b border-border/50">
                    <TableHead className="pl-6 h-auto py-4">
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase tracking-widest font-bold">Produto</span>
                        <div className="relative">
                          <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                          <Input 
                            placeholder="Filtrar..." 
                            className="h-7 text-[10px] pl-7 bg-white/50"
                            value={filters.name}
                            onChange={(e) => setFilters({...filters, name: e.target.value})}
                          />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="h-auto py-4">
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase tracking-widest font-bold">Cód. Interno</span>
                        <div className="relative">
                          <Filter className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                          <Input 
                            placeholder="EAN-8..." 
                            className="h-7 text-[10px] pl-7 bg-white/50 font-mono"
                            value={filters.internalCode}
                            onChange={(e) => setFilters({...filters, internalCode: e.target.value})}
                          />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="h-auto py-4">
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase tracking-widest font-bold">Cód. Fabricante</span>
                        <div className="relative">
                          <BarcodeIcon className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                          <Input 
                            placeholder="EAN-13..." 
                            className="h-7 text-[10px] pl-7 bg-white/50 font-mono"
                            value={filters.barcode}
                            onChange={(e) => setFilters({...filters, barcode: e.target.value})}
                          />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="h-auto py-4">
                      <div className="space-y-2">
                        <span className="text-[11px] uppercase tracking-widest font-bold">NCM</span>
                        <div className="relative">
                          <ClipboardList className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                          <Input 
                            placeholder="Fiscal..." 
                            className="h-7 text-[10px] pl-7 bg-white/50 font-mono"
                            value={filters.ncm}
                            onChange={(e) => setFilters({...filters, ncm: e.target.value})}
                          />
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="h-auto py-4 text-[11px] uppercase tracking-widest font-bold">Preço</TableHead>
                    <TableHead className="h-auto py-4 text-[11px] uppercase tracking-widest font-bold">Estoque</TableHead>
                    <TableHead className="text-right pr-6 h-auto py-4 text-[11px] uppercase tracking-widest font-bold">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-primary/[0.02] transition-colors border-b border-border/30">
                      <TableCell className="pl-6 py-4">
                        <div className="font-bold text-foreground text-sm">{product.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{product.brand} | {product.model || '-'}</div>
                        <Badge variant="secondary" className="mt-1 rounded-md font-bold text-[8px] px-1 py-0 uppercase bg-muted text-muted-foreground border-none">
                          {product.category || "Geral"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="text-[10px] font-mono font-bold bg-primary/10 text-primary border-primary/20 px-1.5 h-5 uppercase tracking-tighter">
                          {product.internalCode || '---'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <BarcodeIcon className="h-3.5 w-3.5 opacity-50" />
                          <span className="text-[11px] font-mono font-medium tracking-tight">
                            {product.barcode || '---'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        {product.ncm ? (
                          <Badge variant="outline" className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 border-amber-500/20 px-1.5 h-5 uppercase tracking-tighter">
                            {product.ncm}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground opacity-30">---</span>
                        )}
                      </TableCell>
                      <TableCell className="py-4 font-black text-foreground">
                        R$ {product.price?.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-4">
                        <div className={`inline-flex items-center gap-1.5 font-black text-sm ${product.quantity < 5 ? "text-destructive" : "text-emerald-600"}`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${product.quantity < 5 ? "bg-destructive animate-pulse" : "bg-emerald-600"}`} />
                          {product.quantity} <span className="text-[10px] font-bold text-muted-foreground uppercase">un</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-primary hover:bg-primary/10 rounded-lg"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-32 opacity-30">
                        <Package className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest">Nenhum item localizado</p>
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
