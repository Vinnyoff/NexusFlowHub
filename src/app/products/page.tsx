
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Trash2, Loader2, Package, Layers } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("vestuario");
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    stock: "",
    size: "M",
    category: "Vestuário"
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

  const handleSaveProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      toast({ 
        variant: "destructive", 
        title: "Campos obrigatórios", 
        description: "Por favor, preencha o nome e o preço do produto." 
      });
      return;
    }

    if (!isAdmin) {
      toast({ 
        variant: "destructive", 
        title: "Acesso negado", 
        description: "Apenas administradores podem cadastrar produtos." 
      });
      return;
    }

    const productId = crypto.randomUUID();
    const prefix = activeTab === "calcas" ? "PNT" : "FF";
    const barcode = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${newProduct.size}`;
    
    const productData = {
      id: productId,
      name: newProduct.name,
      brand: newProduct.brand,
      model: newProduct.model,
      category: activeTab === "calcas" ? "Calças" : "Vestuário",
      size: newProduct.size,
      price: parseFloat(newProduct.price) || 0,
      quantity: parseInt(newProduct.stock) || 0,
      barcode: barcode
    };

    const docRef = doc(firestore, "products", productId);
    
    setDocumentNonBlocking(docRef, productData, { merge: true });
    
    setIsAdding(false);
    resetForm();
    
    toast({ 
      title: "Produto Cadastrado", 
      description: `${productData.name} foi adicionado ao estoque.` 
    });
  };

  const resetForm = () => {
    setNewProduct({ 
      name: "", 
      brand: "", 
      model: "", 
      price: "", 
      stock: "", 
      size: activeTab === "calcas" ? "40" : "M",
      category: activeTab === "calcas" ? "Calças" : "Vestuário"
    });
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setNewProduct(prev => ({
      ...prev,
      category: val === "calcas" ? "Calças" : "Vestuário",
      size: val === "calcas" ? "40" : "M"
    }));
  };

  const handleDelete = (id: string) => {
    if (!isAdmin || !firestore) return;
    const docRef = doc(firestore, "products", id);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Removido", description: "Produto excluído do estoque." });
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
            Apenas administradores podem gerenciar o estoque e cadastrar novos produtos.
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
            <h1 className="text-3xl font-headline font-bold text-primary">Estoque de Produtos</h1>
            <p className="text-muted-foreground">Gerencie o catálogo e variações de tamanho.</p>
          </div>
          
          <Dialog open={isAdding} onOpenChange={(open) => {
            setIsAdding(open);
            if (open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-accent text-white gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Cadastrar Novo Produto</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="vestuario" value={activeTab} onValueChange={handleTabChange} className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1">
                  <TabsTrigger value="vestuario" className="rounded-md font-bold text-xs uppercase tracking-wider">
                    <Layers className="h-4 w-4 mr-2" /> Vestuário Geral
                  </TabsTrigger>
                  <TabsTrigger value="calcas" className="rounded-md font-bold text-xs uppercase tracking-wider">
                    <Package className="h-4 w-4 mr-2" /> Painel de Calças
                  </TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-2 gap-6 py-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Nome do Produto</Label>
                    <Input 
                      placeholder="Ex: Camiseta Oversized ou Calça Jeans Slim" 
                      value={newProduct.name}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                      className="rounded-xl border-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Marca</Label>
                    <Input 
                      placeholder="Ex: Nike ou Levi's" 
                      value={newProduct.brand}
                      onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                      className="rounded-xl border-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Modelo</Label>
                    <Input 
                      placeholder="Ex: Sport ou Skinny" 
                      value={newProduct.model}
                      onChange={e => setNewProduct({...newProduct, model: e.target.value})}
                      className="rounded-xl border-primary/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Preço (R$)</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0,00" 
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      className="rounded-xl border-primary/10"
                    />
                  </div>

                  <TabsContent value="vestuario" className="col-span-2 m-0 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tamanho Vestuário</Label>
                      <div className="flex flex-wrap gap-2">
                        {["PP", "P", "M", "G", "GG", "EG", "U"].map(size => (
                          <Badge 
                            key={size} 
                            variant={newProduct.size === size ? "default" : "outline"} 
                            className="px-4 py-2 cursor-pointer transition-all hover:scale-105"
                            onClick={() => setNewProduct({...newProduct, size})}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="calcas" className="col-span-2 m-0 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Tamanho Numérico (Calças)</Label>
                      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
                        {["34", "36", "38", "40", "42", "44", "46", "48", "50", "52"].map(size => (
                          <Badge 
                            key={size} 
                            variant={newProduct.size === size ? "default" : "outline"} 
                            className="px-3 py-2 cursor-pointer transition-all hover:scale-105 justify-center"
                            onClick={() => setNewProduct({...newProduct, size})}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Quantidade em Estoque</Label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                      className="rounded-xl border-primary/10"
                    />
                  </div>
                </div>
              </Tabs>

              <DialogFooter className="border-t pt-6">
                <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">Cancelar</Button>
                <Button type="button" onClick={handleSaveProduct} className="rounded-xl px-8 shadow-lg shadow-primary/20">Salvar Produto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, marca, código ou categoria..." 
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
                    <TableHead className="pl-6">Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Tam.</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group hover:bg-muted/50 transition-colors">
                      <TableCell className="pl-6 font-semibold text-primary">{product.name}</TableCell>
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
                        Nenhum produto encontrado.
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
