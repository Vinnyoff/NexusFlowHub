
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FileUp, 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Loader2,
  Table as TableIcon,
  ShoppingCart,
  ArrowRight,
  ClipboardList,
  TrendingUp
} from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";

interface InvoiceProduct {
  id: string;
  name: string;
  qty: number;
  price: number;
  convertedPrice: number; // Preço de venda sugerido/convertido
  total: number;
  barcode: string;
  ncm: string;
  status: "new" | "exists";
  existingId?: string;
}

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [invoiceProducts, setInvoiceProducts] = useState<InvoiceProduct[]>([]);
  const [totalInvoice, setTotalInvoice] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: existingProducts } = useCollection(productsQuery);

  const calculateEAN8CheckDigit = (code: string) => {
    let sum = 0;
    const weights = [3, 1, 3, 1, 3, 1, 3];
    for (let i = 0; i < 7; i++) {
      sum += parseInt(code[i]) * weights[i];
    }
    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  };

  const generateInternalCode = () => {
    const base = `${Math.floor(1000000 + Math.random() * 9000000)}`;
    return base + calculateEAN8CheckDigit(base);
  };

  const parseNFXML = (xmlText: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const infNFe = xmlDoc.getElementsByTagName("infNFe")[0];
      if (infNFe) {
        const idAttr = infNFe.getAttribute("Id");
        if (idAttr) setAccessKey(idAttr.replace(/\D/g, ""));
      }

      const items = xmlDoc.getElementsByTagName("det");
      const products: InvoiceProduct[] = [];
      let total = 0;

      for (let i = 0; i < items.length; i++) {
        const prodNode = items[i].getElementsByTagName("prod")[0];
        if (prodNode) {
          const name = prodNode.getElementsByTagName("xProd")[0]?.textContent || "Produto Sem Nome";
          const barcode = prodNode.getElementsByTagName("cEAN")[0]?.textContent || "";
          const ncm = prodNode.getElementsByTagName("NCM")[0]?.textContent || "";
          const qty = parseFloat(prodNode.getElementsByTagName("qCom")[0]?.textContent || "0");
          const price = parseFloat(prodNode.getElementsByTagName("vUnCom")[0]?.textContent || "0");
          const itemTotal = parseFloat(prodNode.getElementsByTagName("vProd")[0]?.textContent || "0");
          
          total += itemTotal;

          const existing = existingProducts?.find(p => 
            (barcode && p.barcode === barcode) || 
            (p.name.toLowerCase() === name.toLowerCase())
          );

          // Cálculo simples de preço convertido (ex: margem de 50%)
          const convertedPrice = price * 1.5;

          products.push({
            id: (i + 1).toString(),
            name,
            qty,
            price,
            convertedPrice,
            total: itemTotal,
            barcode,
            ncm,
            status: existing ? "exists" : "new",
            existingId: existing?.id
          });
        }
      }

      setInvoiceProducts(products);
      setTotalInvoice(total);
      setShowProductsModal(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao ler XML",
        description: "O arquivo selecionado não é um XML de nota fiscal válido.",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xml")) {
      toast({
        variant: "destructive",
        title: "Arquivo Inválido",
        description: "Por favor, selecione um arquivo XML de Nota Fiscal.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      parseNFXML(content);
    };
    reader.readAsText(file);
  };

  const handleConsultKey = () => {
    if (accessKey.length < 44) {
      toast({
        variant: "destructive",
        title: "Chave Inválida",
        description: "A chave de acesso deve conter 44 dígitos numéricos.",
      });
      return;
    }

    setIsConsulting(true);
    
    setTimeout(() => {
      setIsConsulting(false);
      const mockItems: InvoiceProduct[] = [
        { id: "1", name: "Produto Exemplo 01", qty: 10, price: 45.00, convertedPrice: 67.50, total: 450.00, barcode: "7891234567890", ncm: "61091000", status: "new" },
        { id: "2", name: "Produto Exemplo 02", qty: 5, price: 110.00, convertedPrice: 165.00, total: 550.00, barcode: "7890987654321", ncm: "62034200", status: "exists", existingId: existingProducts?.[0]?.id },
      ];
      setInvoiceProducts(mockItems);
      setTotalInvoice(1000.00);
      setShowProductsModal(true);
    }, 1500);
  };

  const handleFinalizeImport = async () => {
    if (!firestore || invoiceProducts.length === 0) return;

    setIsFinalizing(true);
    const batch = writeBatch(firestore);

    try {
      invoiceProducts.forEach((item) => {
        if (item.status === "exists" && item.existingId) {
          const existing = existingProducts?.find(p => p.id === item.existingId);
          const docRef = doc(firestore, "products", item.existingId);
          batch.update(docRef, {
            quantity: (existing?.quantity || 0) + item.qty,
            price: item.convertedPrice, // Usa o preço convertido para venda
            ncm: item.ncm || existing?.ncm || ""
          });
        } else {
          const newId = crypto.randomUUID();
          const docRef = doc(firestore, "products", newId);
          batch.set(docRef, {
            id: newId,
            name: item.name,
            brand: "Importado",
            model: "NF-e",
            category: "Geral",
            size: "Padrão",
            price: item.convertedPrice, // Usa o preço convertido para venda
            quantity: item.qty,
            barcode: item.barcode,
            ncm: item.ncm,
            internalCode: generateInternalCode()
          });
        }
      });

      await batch.commit();

      setShowProductsModal(false);
      setAccessKey("");
      setInvoiceProducts([]);
      
      toast({
        title: "Sucesso!",
        description: `${invoiceProducts.length} itens foram processados e o estoque foi atualizado.`,
      });
    } catch (error) {
      console.error("Erro na importação:", error);
      toast({
        variant: "destructive",
        title: "Erro na Importação",
        description: "Não foi possível atualizar o estoque. Tente novamente.",
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  const updateConvertedPrice = (id: string, newPrice: string) => {
    const val = parseFloat(newPrice) || 0;
    setInvoiceProducts(prev => prev.map(p => p.id === id ? { ...p, convertedPrice: val } : p));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Importação de Notas</h1>
          <p className="text-muted-foreground">Entrada de mercadorias automática via Chave de Acesso ou Arquivo XML.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <Search className="h-5 w-5 text-primary" /> Consulta por Chave de Acesso
                </CardTitle>
                <CardDescription>Insira os 44 dígitos da NF-e para importação direta da Sefaz.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accessKey" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chave de Acesso (NF-e)</Label>
                  <div className="flex gap-3">
                    <Input 
                      id="accessKey"
                      placeholder="0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000" 
                      value={accessKey}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").substring(0, 44);
                        setAccessKey(val);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConsultKey();
                      }}
                      className="h-12 text-lg font-mono tracking-wider bg-muted/20 rounded-xl"
                    />
                    <Button 
                      onClick={handleConsultKey} 
                      disabled={isConsulting || accessKey.length < 44}
                      className="h-12 px-8 font-bold gap-2 bg-primary hover:bg-accent rounded-xl shadow-lg shadow-primary/20"
                    >
                      {isConsulting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      Consultar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className={`border-2 border-dashed transition-all cursor-pointer ${
                isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/10"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { 
                e.preventDefault(); 
                setIsDragging(false); 
                if (e.dataTransfer.files?.[0]) {
                  const file = e.dataTransfer.files[0];
                  const reader = new FileReader();
                  reader.onload = (ev) => parseNFXML(ev.target?.result as string);
                  reader.readAsText(file);
                }
              }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".xml" 
                  className="hidden" 
                />
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileUp className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Importar Arquivo XML</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Clique aqui ou arraste o arquivo da nota fiscal para processar os itens automaticamente.
                  </p>
                </div>
                <Button variant="outline" className="gap-2 rounded-xl">
                  <Upload className="h-4 w-4" /> Selecionar XML do Computador
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Conexão com Banco</p>
                    <p className="text-xs text-muted-foreground">Pronto para atualizar estoque.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Leitor XML 4.0</p>
                    <p className="text-xs text-muted-foreground">Mapeamento de EAN e NCM ativo.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-white border-none shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
                  <AlertCircle className="h-5 w-5" /> Importação Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs opacity-90 leading-relaxed">
                  O sistema reconhece itens cadastrados pelo Código de Barras e importa automaticamente o <strong>NCM</strong> para conformidade fiscal.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showProductsModal} onOpenChange={setShowProductsModal}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 border-b bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white">
                  <TableIcon className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary">Conferência da Nota</DialogTitle>
                  <DialogDescription className="text-xs font-mono">Chave: {accessKey || "Importação Manual"}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="pl-6 text-[10px] font-bold uppercase">Produto na Nota</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase">Fiscal (NCM)</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase">Qtd</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase">Preço Compra</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase text-primary bg-primary/5">Preço Convertido</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase">Total Item</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoiceProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="pl-6">
                        <p className="font-bold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">EAN: {product.barcode || "SEM CÓDIGO"}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <ClipboardList className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-mono text-muted-foreground">{product.ncm || "---"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">{product.qty}</TableCell>
                      <TableCell className="text-right font-medium">R$ {product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right bg-primary/5">
                        <div className="flex items-center justify-end gap-2">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <Input 
                            type="number" 
                            step="0.01"
                            value={product.convertedPrice}
                            onChange={(e) => updateConvertedPrice(product.id, e.target.value)}
                            className="h-8 w-24 text-right font-black text-primary border-primary/20 bg-white"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">R$ {product.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {product.status === "exists" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] uppercase font-bold">Atualizar</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] uppercase font-bold">Novo</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-6 border-t bg-muted/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none">Total da Nota</p>
                  <p className="text-xl font-black text-primary">R$ {totalInvoice.toFixed(2)}</p>
                </div>
              </div>
              <DialogFooter className="w-full md:w-auto flex gap-3">
                <Button variant="ghost" onClick={() => setShowProductsModal(false)} className="rounded-xl px-6 h-11" disabled={isFinalizing}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleFinalizeImport} 
                  disabled={isFinalizing || invoiceProducts.length === 0}
                  className="bg-primary hover:bg-accent text-white font-bold rounded-xl px-8 h-11 gap-2 shadow-lg shadow-primary/20"
                >
                  {isFinalizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Confirmar e Importar
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
