
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Barcode, Printer, Trash2, Edit, Loader2, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/app/lib/auth-store";

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    brand: "",
    model: "",
    price: "",
    stock: "",
    size: "M"
  });
  
  const { firestore } = useFirestore();
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
    if (!firestore || !newProduct.name || !newProduct.price || !isAdmin) return;

    const productId = crypto.randomUUID();
    const barcode = `FF-${Math.floor(1000 + Math.random() * 9000)}-${newProduct.size}`;
    
    const productData = {
      id: productId,
      name: newProduct.name,
      brand: newProduct.brand,
      model: newProduct.model,
      size: newProduct.size,
      price: parseFloat(newProduct.price),
      quantity: parseInt(newProduct.stock) || 0,
      barcode: barcode
    };

    setDocumentNonBlocking(doc(firestore, "products", productId), productData, { merge: true });
    
    setIsAdding(false);
    setNewProduct({ name: "", brand: "", model: "", price: "", stock: "", size: "M" });
    toast({ title: "Sucesso", description: "Produto cadastrado com sucesso!" });
  };

  const handleDelete = (id: string) => {
    if (!firestore || !isAdmin) return;
    deleteDoc(doc(firestore, "products", id));
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
          
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-accent text-white gap-2">
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Cadastrar Novo Produto</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Produto</Label>
                  <Input 
                    placeholder="Ex: Camiseta Oversized" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input 
                    placeholder="Ex: Nike" 
                    value={newProduct.brand}
                    onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input 
                    placeholder="Ex: Sport" 
                    value={newProduct.model}
                    onChange={e => setNewProduct({...newProduct, model: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0,00" 
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Tamanhos Disponíveis</Label>
                  <div className="flex gap-2">
                    {["P", "M", "G", "GG", "EG"].map(size => (
                      <Badge 
                        key={size} 
                        variant={newProduct.size === size ? "default" : "outline"} 
                        className="px-4 py-2 cursor-pointer transition-colors"
                        onClick={() => setNewProduct({...newProduct, size})}
                      >
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Qtd em Estoque</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={handleSaveProduct}>Salvar Produto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nome, marca ou código..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Tam.</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="group">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">{product.brand}</div>
                        <div className="text-sm">{product.model}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-bold">{product.size}</Badge>
                      </TableCell>
                      <TableCell>R$ {product.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={product.quantity < 5 ? "text-destructive font-bold" : ""}>
                          {product.quantity} un
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-xs">{product.barcode}</code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
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
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
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
