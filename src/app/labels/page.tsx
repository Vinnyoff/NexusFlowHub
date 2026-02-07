"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Printer, Tag, Loader2, Plus, Trash2, FileText, ShoppingBag } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Barcode from "react-barcode";

interface QueueItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  internalCode: string;
  quantity: number;
}

export default function LabelsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [labelQueue, setLabelQueue] = useState<QueueItem[]>([]);
  
  const firestore = useFirestore();
  
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: products, isLoading } = useCollection(productsQuery);

  const filteredProducts = products?.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.internalCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const addToQueue = (product: any) => {
    setLabelQueue(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        brand: product.brand,
        model: product.model || "",
        price: product.price,
        internalCode: product.internalCode,
        quantity: 1
      }];
    });
  };

  const removeFromQueue = (id: string) => {
    setLabelQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateQueueQuantity = (id: string, qty: number) => {
    setLabelQueue(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, qty) } : item
    ));
  };

  const handlePrint = () => {
    if (labelQueue.length > 0) {
      window.print();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 print:hidden">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Emissão de Etiquetas</h1>
          <p className="text-muted-foreground">Gerencie sua fila de impressão e gere identificações em lote (EAN-8).</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar produtos para adicionar à fila..." 
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
                      <TableHead>Preço</TableHead>
                      <TableHead className="text-right pr-6">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="pl-6">
                          <div className="font-semibold text-sm">{product.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{product.brand} | {product.model || 'Padrão'}</div>
                          <Badge variant="outline" className="mt-1 text-[9px] font-mono h-4 bg-primary/5 text-primary border-primary/20">
                            {product.internalCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-sm">R$ {product.price?.toFixed(2)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <Button 
                            variant="ghost"
                            size="sm"
                            onClick={() => addToQueue(product)}
                            className="rounded-xl h-8 px-4 text-primary hover:bg-primary/10"
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Fila
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-none shadow-sm sticky top-24">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg font-headline flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Printer className="h-5 w-5 text-primary" /> Fila de Impressão
                  </div>
                  <Badge className="bg-primary">{labelQueue.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {labelQueue.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <ShoppingBag className="h-10 w-10 mx-auto opacity-20 mb-2" />
                    <p className="text-xs italic">A fila está vazia.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {labelQueue.map((item) => (
                      <div key={item.id} className="flex flex-col gap-2 p-3 border rounded-xl bg-card">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-primary uppercase">{item.brand}</p>
                            <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive" 
                            onClick={() => removeFromQueue(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[9px] font-bold uppercase text-muted-foreground">Qtd:</label>
                          <Input 
                            type="number" 
                            min="1" 
                            value={item.quantity}
                            onChange={(e) => updateQueueQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="h-7 w-20 text-xs rounded-lg"
                          />
                          <div className="flex-1 text-right font-bold text-xs">
                            R$ {item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t space-y-3">
                  <Button 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-accent text-white font-bold gap-2"
                    disabled={labelQueue.length === 0}
                    onClick={handlePrint}
                  >
                    <Printer className="h-5 w-5" /> IMPRIMIR LOTE
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-10 rounded-xl gap-2 text-xs"
                    disabled={labelQueue.length === 0}
                    onClick={() => setLabelQueue([])}
                  >
                    Limpar Fila
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-none">
              <CardContent className="p-4 flex gap-3">
                <FileText className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  As etiquetas incluem <strong>Fabricante</strong>, <strong>Nome</strong>, <strong>Preço</strong> e <strong>EAN-8</strong>. O layout é otimizado para economia de papel e máxima legibilidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="hidden print:block bg-white p-0 m-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: auto; margin: 0mm; }
            body { margin: 0; padding: 0; background-color: white !important; }
          }
        `}} />
        <div className="flex flex-wrap gap-1 p-2 bg-white">
          {labelQueue.flatMap((item) => 
            Array.from({ length: item.quantity }).map((_, i) => (
              <div 
                key={`${item.id}-${i}`} 
                className="border border-black p-2 w-[50mm] h-[30mm] flex flex-col items-center justify-between bg-white overflow-hidden"
                style={{ pageBreakInside: 'avoid' }}
              >
                <p className="text-[8px] font-black text-black uppercase text-center line-clamp-1 border-b border-black w-full pb-0.5">
                  {item.brand || 'FABRICANTE'}
                </p>
                <div className="text-center w-full">
                  <p className="text-[9px] text-black font-bold line-clamp-1 leading-tight">{item.name}</p>
                  <p className="text-[7px] text-black font-medium line-clamp-1 opacity-80">{item.model || ''}</p>
                </div>
                <div className="flex flex-col items-center flex-1 justify-center py-1 scale-95">
                  <Barcode 
                    value={item.internalCode || "00000000"} 
                    format="EAN8"
                    width={1.5} 
                    height={35} 
                    fontSize={8}
                    margin={0}
                  />
                </div>
                <p className="text-[13px] font-black text-black">R$ {item.price?.toFixed(2)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
