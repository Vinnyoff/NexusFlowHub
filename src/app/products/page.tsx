"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2, Package, Layers, Barcode, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/app/lib/auth-store";
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("principal");
  const [newProduct, setNewProduct] = useState({
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

  const handleGenerateBarcode = () => {
    const randomCode = `789${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setNewProduct({ ...newProduct, barcode: randomCode });
    toast({ title: "Código Gerado", description: "Um código de barras temporário foi atribuído." });
  };

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price) {
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
        description: "Apenas administradores podem cadastrar itens." 
      });
      return;
    }

    const productId = crypto.randomUUID();
    // Se não houver código de barras, gera um aleatório curto
    const barcode = newProduct.barcode || `NX-${Math.floor(1000 + Math.random() * 8999)}-${newProduct.variant.replace(/\s+/g, '')}`;
    
    const productData = {
      id: productId,
      name: newProduct.name,
      brand: newProduct.brand,
      model: newProduct.model,
      category: newProduct.category || "Geral",
      size: newProduct.variant,
      price: parseFloat(newProduct.price) || 0,
      quantity: parseInt(newProduct.stock) || 0,
      barcode: barcode
    };

    const docRef = doc(firestore, "products", productId);
    
    setDocumentNonBlocking(docRef, productData, { merge: true });
    
    setIsAdding(false);
    resetForm();
    
    toast({ 
      title: "Item Registrado", 
      description: `${productData.name} foi adicionado ao inventário.` 
    });
  };

  const resetForm = () => {
    setNewProduct({ 
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
          
          <Dialog open={isAdding} onOpenChange={(open) => {
            setIsAdding(open);
            if (open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-accent text-white gap-2">
                <Plus className="h-4 w-4" />
                Novo Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-xl">Cadastrar Novo Item</DialogTitle>
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
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Fabricante/Marca</Label>
                    <Input 
                      placeholder="Ex: Dell" 
                      value={newProduct.brand}
                      onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                      className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                    />
                  </div>
                  
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Categoria</Label>
                    <Input 
                      placeholder="Ex: Eletrônicos" 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
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
                        value={newProduct.price}
                        onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Quantidade</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        value={newProduct.stock}
                        onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="detalhes" className="col-span-2 m-0 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Código de Barras (Manual ou Leitor)</Label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Barcode className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input 
                            placeholder="Aguardando leitura ou digitação..." 
                            value={newProduct.barcode}
                            onChange={e => setNewProduct({...newProduct, barcode: e.target.value})}
                            className="rounded-xl border-primary/10 h-11 pl-10 text-sm bg-muted/20"
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="h-11 rounded-xl border-dashed gap-2 text-xs"
                          onClick={handleGenerateBarcode}
                        >
                          <Sparkles className="h-4 w-4 text-primary" />
                          Gerar
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Modelo / SKU</Label>
                      <Input 
                        placeholder="Ex: K780-Wireless" 
                        value={newProduct.model}
                        onChange={e => setNewProduct({...newProduct, model: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest pl-1">Variante</Label>
                      <Input 
                        placeholder="Ex: Preto" 
                        value={newProduct.variant}
                        onChange={e => setNewProduct({...newProduct, variant: e.target.value})}
                        className="rounded-xl border-primary/10 h-11 text-sm bg-muted/20"
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter className="border-t pt-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="rounded-xl">Cancelar</Button>
                <Button type="button" size="sm" onClick={handleSaveProduct} className="rounded-xl px-6 shadow-lg shadow-primary/20">Salvar Item</Button>
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
                        <div className="text-[10px] text-muted-foreground font-mono mt-1">EAN: {product.barcode}</div>
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
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
