
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
  ArrowRight
} from "lucide-react";
import { useState } from "react";
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

interface InvoiceProduct {
  id: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  status: "new" | "exists";
}

const MOCK_INVOICE_PRODUCTS: InvoiceProduct[] = [
  { id: "1", name: "Camiseta Basic Black M", qty: 25, price: 45.90, total: 1147.50, status: "exists" },
  { id: "2", name: "Calça Jeans Slim Blue 42", qty: 10, price: 89.00, total: 890.00, status: "exists" },
  { id: "3", name: "Jaqueta Bomber Nexus V2", qty: 5, price: 159.00, total: 795.00, status: "new" },
  { id: "4", name: "Tênis Sport Tech White 40", qty: 8, price: 210.00, total: 1680.00, status: "new" },
];

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const { toast } = useToast();

  const handleSimulateUpload = () => {
    toast({
      title: "Processando Nota",
      description: "O sistema está lendo os dados do arquivo XML/PDF...",
    });
    
    setTimeout(() => {
      setShowProductsModal(true);
    }, 1500);
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
    
    // Simula tempo de resposta da Sefaz
    setTimeout(() => {
      setIsConsulting(false);
      setShowProductsModal(true);
    }, 2000);
  };

  const handleFinalizeImport = () => {
    setShowProductsModal(false);
    setAccessKey("");
    toast({
      title: "Sucesso!",
      description: "Produtos importados e estoque atualizado com sucesso.",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Importação de Notas</h1>
          <p className="text-muted-foreground">Entrada de mercadorias automática via Chave de Acesso, XML ou PDF.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Campo de Chave de Acesso */}
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
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-muted-foreground">
                      {accessKey.length}/44 dígitos digitados
                    </p>
                    {accessKey.length === 44 && !isConsulting && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Chave Completa
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Area de Upload */}
            <Card 
              className={`border-2 border-dashed transition-all ${
                isDragging ? "border-primary bg-primary/5" : "border-border"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSimulateUpload(); }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileUp className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Ou arraste seu arquivo aqui</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Suporte para arquivos XML de NF-e e PDFs de faturamento.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSimulateUpload} variant="outline" className="gap-2 rounded-xl">
                    <Upload className="h-4 w-4" /> Selecionar XML/PDF
                  </Button>
                </div>
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
                    <p className="text-sm font-bold">Sefaz Online</p>
                    <p className="text-xs text-muted-foreground">Consulta de chaves disponível.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">Leitor XML</p>
                    <p className="text-xs text-muted-foreground">Padrão 4.0 atualizado.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-white border-none shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2 text-white">
                  <AlertCircle className="h-5 w-5" /> Dica Nexus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs opacity-90 leading-relaxed">
                  Ao importar uma nota via chave ou arquivo, o sistema cruza os produtos automaticamente pelo EAN. 
                  Itens não cadastrados serão destacados para você decidir se deseja criá-los.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de Conferência de Produtos */}
        <Dialog open={showProductsModal} onOpenChange={setShowProductsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
            <DialogHeader className="p-6 border-b bg-muted/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white">
                  <TableIcon className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-headline font-bold text-primary">Conferência de Produtos</DialogTitle>
                  <DialogDescription className="text-xs font-mono">NF-e: {accessKey.replace(/(.{4})/g, '$1 ')}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-0">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="pl-6 text-[10px] font-bold uppercase">Produto Identificado</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase">Qtd</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase">Preço Un.</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase">Total Item</TableHead>
                    <TableHead className="text-center text-[10px] font-bold uppercase">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_INVOICE_PRODUCTS.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="pl-6">
                        <p className="font-bold text-sm">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground">REF: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                      </TableCell>
                      <TableCell className="text-center font-bold">{product.qty}</TableCell>
                      <TableCell className="text-right font-medium">R$ {product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-black text-primary">R$ {product.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        {product.status === "exists" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] uppercase font-bold">Cadastrado</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] uppercase font-bold">Novo Item</Badge>
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
                  <p className="text-xl font-black text-primary">R$ 4.512,50</p>
                </div>
              </div>
              <DialogFooter className="w-full md:w-auto flex gap-3">
                <Button variant="ghost" onClick={() => setShowProductsModal(false)} className="rounded-xl px-6 h-11">
                  Cancelar
                </Button>
                <Button onClick={handleFinalizeImport} className="bg-primary hover:bg-accent text-white font-bold rounded-xl px-8 h-11 gap-2 shadow-lg shadow-primary/20">
                  Confirmar Importação <ArrowRight className="h-4 w-4" />
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-headline">Últimas Importações</CardTitle>
            <CardDescription>Histórico de processamento de arquivos recentes.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground italic text-sm">
              Nenhuma importação processada nesta sessão.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
