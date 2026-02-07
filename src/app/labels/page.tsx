
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Printer, Tag, Loader2, Barcode, CheckCircle2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LabelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  
  const firestore = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6 print:hidden">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Emissão de Etiquetas</h1>
          <p className="text-muted-foreground">Gere identificação física para seus produtos com código de barras.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seletor de Produtos */}
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produto por nome ou código..." 
                  className="pl-10 rounded-xl"
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
                    <TableRow>
                      <TableHead className="pl-6">Produto</TableHead>
                      <TableHead>Identificação</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right pr-6">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id} className={selectedProduct?.id === product.id ? "bg-primary/5" : ""}>
                        <TableCell className="pl-6 font-semibold">
                          {product.name}
                          <div className="text-[10px] text-muted-foreground font-mono">EAN: {product.barcode}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{product.brand}</Badge>
                          <div className="text-xs text-muted-foreground mt-0.5">{product.size}</div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">R$ {product.price?.toFixed(2)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant={selectedProduct?.id === product.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setSelectedProduct(product)}
                            className="rounded-xl"
                          >
                            {selectedProduct?.id === product.id ? <CheckCircle2 className="h-4 w-4 text-primary" /> : "Selecionar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pré-visualização e Configuração */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <Printer className="h-5 w-5 text-primary" /> Configurar Impressão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Quantidade de Etiquetas</label>
                  <Input 
                    type="number" 
                    min="1" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="rounded-xl"
                  />
                </div>
                
                <div className="p-4 border border-dashed rounded-xl bg-muted/20 flex flex-col items-center justify-center min-h-[150px]">
                  {selectedProduct ? (
                    <div className="text-center space-y-2">
                      <p className="text-xs font-bold text-primary uppercase">{selectedProduct.name}</p>
                      <div className="bg-white p-2 border rounded">
                        <Barcode className="h-10 w-32 mx-auto text-black" />
                        <p className="text-[8px] font-mono text-black mt-1">{selectedProduct.barcode}</p>
                      </div>
                      <p className="text-sm font-bold">R$ {selectedProduct.price?.toFixed(2)}</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Tag className="h-10 w-10 mx-auto opacity-20 mb-2" />
                      <p className="text-xs italic">Selecione um produto para visualizar a etiqueta.</p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-accent text-white font-bold gap-2"
                  disabled={!selectedProduct}
                  onClick={handlePrint}
                >
                  <Printer className="h-5 w-5" /> IMPRIMIR ETIQUETAS
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong>Dica:</strong> Para melhores resultados em impressoras térmicas, use o formato de etiqueta 40x25mm ou 50x30mm. O sistema gera os códigos automaticamente no padrão EAN-13.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Versão de Impressão (Oculta na UI normal) */}
      <div className="hidden print:block bg-white p-0 m-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: quantity }).map((_, i) => (
            <div key={i} className="border border-black p-2 w-[50mm] h-[30mm] flex flex-col items-center justify-between bg-white overflow-hidden mb-2">
              <p className="text-[10px] font-bold text-black uppercase text-center line-clamp-1">NexusFlow - {selectedProduct?.brand}</p>
              <p className="text-[9px] text-black text-center font-bold line-clamp-1">{selectedProduct?.name} ({selectedProduct?.size})</p>
              <div className="flex flex-col items-center">
                <Barcode className="h-8 w-28 text-black" />
                <p className="text-[7px] font-mono text-black">{selectedProduct?.barcode}</p>
              </div>
              <p className="text-[12px] font-black text-black">R$ {selectedProduct?.price?.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
