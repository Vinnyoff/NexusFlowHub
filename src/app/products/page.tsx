
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2, Package, Layers, Barcode as BarcodeIcon, Sparkles, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/app/lib/auth-store";
import { setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("principal");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    stock: "",
    variant: "Padrão",
    category: "Geral",
    barcode: ""
  });
  
  const firestore = useFirestore();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const calculateEAN8CheckDigit = (code: string) => {
    // EAN-8 logic: weight 3, 1, 3, 1, 3, 1, 3
    let sum = 0;
    const weights = [3, 1, 3, 1, 3, 1, 3];
    for (let i = 0; i < 7; i++) {
      sum += parseInt(code[i]) * weights[i];
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  };

  const handleGenerateBarcode = () => {
    // Gera base de 7 dígitos aleatórios para EAN-8 interno
    const base = `${Math.floor(1000000 + Math.random() * 9000000)}`;
    const checkDigit = calculateEAN8CheckDigit(base);
    const fullCode = base + checkDigit;
    
    setFormData({ ...formData, barcode: fullCode });
    toast({ title: "Código Interno Gerado", description: `EAN-8 gerado: ${fullCode}` });
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
      barcode: product.barcode || ""
    });
    setIsDialogOpen(true);
    setActiveTab("principal");
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.price) {
      toast({ 
        variant: "destructive", 
        title: "Campos obrigatórios", 
        description: "Por favor, preencha o nome e o preço do item." 
      });
      return;
    }

    if (!isAdmin) {
      toast({ 
        variant: "destructive", 
        title: "Acesso negado", 
        description: "Apenas administradores podem gerenciar itens." 
      });
      return;
    }

    // Se não houver código de barras, gera um EAN-8 automático
    let finalBarcode = formData.barcode;
    if (!finalBarcode) {
      const base = `${Math.floor(1000000 + Math.random() * 9000000)}`;
      finalBarcode = base + calculateEAN8CheckDigit(base);
    }

    const productData: any = {
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      category: formData.category || "Geral",
      size: formData.variant,
      price: parseFloat(formData.price) || 0,
      quantity: parseInt(formData.stock) || 0,
      barcode: finalBarcode
    };

    if (editingId) {
      const docRef = doc(firestore, "products", editingId);
      updateDocumentNonBlocking(docRef, productData);
      toast({ 
        title: "Item Atualizado", 
        description: `${productData.name} foi atualizado com sucesso.` 
      });
    } else {
      const productId = crypto.randomUUID();
      const docRef = doc(firestore, "products", productId);
      setDocumentNonBlocking(docRef, { ...productData, id: productId }, { merge: true });
      toast({ 
        title: "Item Registrado", 
        description: `${productData.name} foi adicionado ao inventário com código ${finalBarcode}.` 
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
      barcode: ""
    });
  };

  const handleDelete = (id: string) => {
    if (!isAdmin || !firestore) return;
    const docRef = doc(firestore, "products", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removido", description: "Item excluído do inventário." });
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="bg-destructive/10 p-4 rounded-full">
            <Package className="h-12 w-12 text-destructive opacity-50" />
          </div>
          <h1 className="text-2xl font-headline font-bold">Acesso Restrito</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Apenas administradores podem gerenciar o inventário.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-primary">Inventário de Produtos</h1>
            <p className="text-muted-foreground">Controle central de mercadorias e insumos.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="bg-primary hover:bg-accent text-white gap-2">
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl">
                  {editingId ? "Editar Item" : "Cadastrar Novo Item"}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="principal" value={activeTab} onValueChange={setActiveTab} className="w-full mt-2">
                <TabsList className="grid w-full grid-cols-2 h-10 bg-muted/50 p-1">
                  <TabsTrigger value="principal" className="rounded-md font-bold text-[10px] uppercase tracking-wider">
                    <Layers className="h-3 w-3 mr-2" /> Identificação
                  </TabsTrigger>
                  <TabsTrigger value="detalhes" className="rounded-md font-bold text-[10px] uppercase tracking-wider">
                    <Package className="h-3 w-3 mr-2" /> Especificações
                  </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Nome do Produto</Label>
                    <Input 
                      placeholder="Ex: Teclado Mecânico" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Fabricante/Marca</Label>
                    <Input 
                      placeholder="Ex: Dell" 
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Categoria</Label>
                    <Input 
                      placeholder="Ex: Eletrônicos" 
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                    />
                  </div>

                  <TabsContent value="principal" className="col-span-2 m-0 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Preço (R$)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Quantidade</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="detalhes" className="col-span-2 m-0 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Código de Barras (EAN-8 Interno)</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <BarcodeIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Aguardando leitura ou digitação..." 
                            value={formData.barcode}
                            onChange={e => setFormData({...formData, barcode: e.target.value})}
                            className="rounded-xl border-primary/10 h-11 pl-10 text-sm bg-muted/20"
                            maxLength={8}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-11 rounded-xl border-dashed gap-2 text-xs"
                          onClick={handleGenerateBarcode}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          Gerar EAN-8
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Modelo / SKU</Label>
                      <Input 
                        placeholder="Ex: K780-Wireless" 
                        value={formData.model}
                        onChange={e => setFormData({...formData, model: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Variante</Label>
                      <Input 
                        placeholder="Ex: Preto" 
                        value={formData.variant}
                        onChange={e => setFormData({...formData, variant: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                <Button type="button" size="sm" onClick={handleSaveProduct} className="rounded-xl px-6 shadow-lg shadow-primary/20">
                  {editingId ? "Atualizar" : "Salvar Item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, categoria, código ou fabricante..." 
                className="pl-10 rounded-xl border-none bg-muted/30 focus-visible:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6">Descrição do Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 font-semibold text-primary">
                        {product.name}
                        <div className="text-[10px] text-muted-foreground font-mono mt-1">EAN-8: {product.barcode}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-md font-bold text-[10px] uppercase">{product.category || "Geral"}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">{product.brand}</div>
                        <div className="text-sm">{product.model}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-bold min-w-[30px] justify-center">{product.size}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">R$ {product.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${product.quantity < 5 ? "text-destructive" : "text-emerald-600"}`}>
                          {product.quantity} un
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
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
                      <TableCell colSpan={7} className="text-center py-20 text-muted-foreground">
                        Nenhum item encontrado no inventário.
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
