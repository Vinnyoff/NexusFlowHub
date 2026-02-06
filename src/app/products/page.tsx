
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Barcode, Printer, Trash2, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ProductVariation {
  id: string;
  name: string;
  brand: string;
  model: string;
  size: string;
  price: number;
  stock: number;
  token: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Mock products data
  const [products, setProducts] = useState<ProductVariation[]>([
    { id: "1", name: "Camiseta Basic", brand: "CottonOn", model: "Regular", size: "M", price: 49.90, stock: 15, token: "P-782-931-M" },
    { id: "2", name: "Camiseta Basic", brand: "CottonOn", model: "Regular", size: "G", price: 49.90, stock: 8, token: "P-782-931-G" },
    { id: "3", name: "Calça Jeans Slim", brand: "Levi's", model: "511", size: "42", price: 299.00, stock: 5, token: "P-455-221-42" },
    { id: "4", name: "Jaqueta Couro", brand: "Zara", model: "Biker", size: "P", price: 549.90, stock: 2, token: "P-112-984-P" },
  ]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <Input placeholder="Ex: Camiseta Oversized" />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input placeholder="Ex: Nike" />
                </div>
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input placeholder="Ex: Sport" />
                </div>
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input type="number" step="0.01" placeholder="0,00" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Tamanhos Disponíveis</Label>
                  <div className="flex gap-2">
                    {["P", "M", "G", "GG", "EG"].map(size => (
                      <Badge key={size} variant="outline" className="px-4 py-2 cursor-pointer hover:bg-primary/10">
                        {size}
                      </Badge>
                    ))}
                    <Input placeholder="Personalizado" className="w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Qtd em Estoque (padrão)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                <Button onClick={() => setIsAdding(false)}>Gerar Variações e Salvar</Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Marca/Modelo</TableHead>
                  <TableHead>Tam.</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Token/Barcode</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.token} className="group">
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">{product.brand}</div>
                      <div className="text-sm">{product.model}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-bold">{product.size}</Badge>
                    </TableCell>
                    <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={product.stock < 5 ? "text-destructive font-bold" : ""}>
                        {product.stock} un
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{product.token}</code>
                        <Barcode className="h-4 w-4 text-primary cursor-help" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
