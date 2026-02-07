
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Printer, Tag, Loader2, CheckCircle2, FileText } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Barcode from "react-barcode";

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
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-6 print:hidden">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Emissão de Etiquetas</h1>
          <p className="text-muted-foreground">Gere identificação física para seus produtos com código EAN-8 interno.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produto por nome, marca ou código..." 
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
                          <div className="text-[10px] text-muted-foreground font-mono">EAN-8: {product.barcode}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{product.brand}</Badge>
                          <div className="text-xs text-muted-foreground mt-0.5">{product.model || 'Padrão'}</div>
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
                    {filteredProducts.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                          Nenhum produto encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

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
                
                <div className="p-4 border border-dashed rounded-xl bg-muted/20 flex flex-col items-center justify-center min-h-[180px]">
                  {selectedProduct ? (
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-tight">
                        {selectedProduct.brand} | {selectedProduct.name}
                      </p>
                      <div className="bg-white p-2 border rounded shadow-sm scale-90 origin-center">
                        <Barcode 
                          value={selectedProduct.barcode} 
                          format="EAN8"
                          width={1.5} 
                          height={50} 
                          fontSize={12}
                          background="#ffffff"
                        />
                      </div>
                      <p className="text-lg font-black">R$ {selectedProduct.price?.toFixed(2)}</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Tag className="h-10 w-10 mx-auto opacity-20 mb-2" />
                      <p className="text-xs italic">Selecione um produto para visualizar a etiqueta.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-accent text-white font-bold gap-2"
                    disabled={!selectedProduct}
                    onClick={handlePrint}
                  >
                    <Printer className="h-5 w-5" /> IMPRIMIR / GERAR PDF
                  </Button>
                  <p className="text-[9px] text-center text-muted-foreground">
                    Formato EAN-8 habilitado para códigos internos.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/50 border-none shadow-none">
              <CardContent className="p-4 flex gap-3">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  As etiquetas utilizam agora o padrão <strong>EAN-8</strong> para melhor compatibilidade com códigos internos reduzidos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden print:block bg-white p-0 m-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: auto;
              margin: 0mm;
            }
            body {
              margin: 0;
              padding: 0;
              background-color: white !important;
            }
          }
        `}} />
        <div className="flex flex-wrap gap-1 p-2 bg-white">
          {Array.from({ length: quantity }).map((_, i) => (
            <div 
              key={i} 
              className="border border-black p-2 w-[50mm] h-[30mm] flex flex-col items-center justify-between bg-white overflow-hidden"
              style={{ pageBreakInside: 'avoid' }}
            >
              {/* Identificação de Marca */}
              <p className="text-[8px] font-black text-black uppercase text-center line-clamp-1 border-b border-black w-full pb-0.5 mb-1">
                {selectedProduct?.brand || 'NEXUSFLOW'}
              </p>
              
              {/* Nome do Produto e Modelo */}
              <div className="text-center w-full">
                <p className="text-[9px] text-black font-bold line-clamp-1 leading-tight">
                  {selectedProduct?.name}
                </p>
                <p className="text-[7px] text-black font-medium line-clamp-1 opacity-80">
                  {selectedProduct?.model || selectedProduct?.size || ''}
                </p>
              </div>

              {/* Código de Barras Real EAN-8 */}
              <div className="flex flex-col items-center flex-1 justify-center py-1 scale-95">
                <Barcode 
                  value={selectedProduct?.barcode || "00000000"} 
                  format="EAN8"
                  width={1.5} 
                  height={35} 
                  fontSize={8}
                  margin={0}
                />
              </div>

              {/* Preço de Venda */}
              <p className="text-[13px] font-black text-black mt-0.5">
                R$ {selectedProduct?.price?.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
