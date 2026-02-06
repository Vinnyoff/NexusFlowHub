
"use client";

import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Barcode, Trash2, CheckCircle2, Search, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  token: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const mockProductDb = [
    { name: "Camiseta Basic", size: "M", price: 49.90, token: "P-782-931-M" },
    { name: "Camiseta Basic", size: "G", price: 49.90, token: "P-782-931-G" },
    { name: "Calça Jeans Slim", size: "42", price: 299.00, token: "P-455-221-42" },
    { name: "Jaqueta Couro", size: "P", price: 549.90, token: "P-112-984-P" },
  ];

  const addToCart = (token: string) => {
    const product = mockProductDb.find(p => p.token === token);
    if (product) {
      setCart(prev => {
        const existing = prev.find(item => item.token === token);
        if (existing) {
          return prev.map(item => item.token === token ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      setBarcodeInput("");
      toast({ title: "Produto adicionado", description: `${product.name} (${product.size})` });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Código de barras não encontrado." });
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput) addToCart(barcodeInput);
  };

  const removeItem = (token: string) => {
    setCart(prev => prev.filter(item => item.token !== token));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const finalizeSale = () => {
    if (cart.length === 0) return;
    setCart([]);
    toast({ title: "Venda Finalizada", description: `Total de R$ ${total.toFixed(2)} registrado com sucesso.` });
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <Barcode className="h-6 w-6 text-primary" />
                Leitura de Código
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-4">
                <div className="relative flex-1">
                  <Input 
                    ref={inputRef}
                    placeholder="Passe o leitor ou digite o código..." 
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="text-lg h-12"
                  />
                  <div className="absolute right-3 top-3.5 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    ENTER para adicionar
                  </div>
                </div>
                <Button type="submit" className="h-12 px-8">Adicionar</Button>
              </form>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground w-full mb-1">Dica: clique para testar</p>
                {mockProductDb.map(p => (
                  <Button 
                    key={p.token} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs border-dashed"
                    onClick={() => addToCart(p.token)}
                  >
                    {p.name} ({p.size})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm min-h-[400px]">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <ShoppingCart className="h-6 w-6 text-primary" />
                Itens da Venda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                  <p>Carrinho vazio. Inicie as vendas passando o leitor.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Unitário</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.token}>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">Tam: {item.size} • {item.token}</div>
                        </TableCell>
                        <TableCell className="font-bold">{item.quantity}x</TableCell>
                        <TableCell>R$ {item.price.toFixed(2)}</TableCell>
                        <TableCell className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive h-8 w-8"
                            onClick={() => removeItem(item.token)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-primary text-white">
            <CardHeader>
              <CardTitle className="font-headline text-center">Resumo do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg opacity-80">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg opacity-80">
                <span>Descontos</span>
                <span>R$ 0,00</span>
              </div>
              <div className="border-t border-white/20 pt-4 flex justify-between text-3xl font-bold">
                <span>TOTAL</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button 
                onClick={finalizeSale}
                className="w-full bg-white text-primary hover:bg-white/90 text-lg font-bold h-14"
                disabled={cart.length === 0}
              >
                <CheckCircle2 className="mr-2 h-6 w-6" />
                FINALIZAR VENDA
              </Button>
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 gap-2">
                  <CreditCard className="h-4 w-4" /> Cartão
                </Button>
                <Button variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 gap-2">
                  <Banknote className="h-4 w-4" /> Dinheiro
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Última Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg">R$ 149,90</p>
                  <p className="text-xs text-muted-foreground">Há 12 minutos • #9822</p>
                </div>
                <Button variant="link" className="text-primary text-xs p-0">Reimprimir Cupom</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
