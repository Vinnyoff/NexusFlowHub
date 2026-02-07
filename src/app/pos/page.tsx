"use client";

import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Barcode, Trash2, CheckCircle2, CreditCard, Banknote, QrCode, Loader2, Plus, Minus, ScanBarcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  size: string;
  price: number;
  quantity: number;
  barcode: string;
  internalCode: string;
}

export default function POSPage() {
  const [barcodeInput, setBarcodeInput] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH" | "PIX">("CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "products");
  }, [firestore]);

  const { data: products, isLoading: isLoadingProducts } = useCollection(productsQuery);

  const addToCart = (code: string) => {
    const product = products?.find(p => p.internalCode === code || p.barcode === code || p.id === code);
    
    if (product) {
      if (product.quantity <= 0) {
        toast({ variant: "destructive", title: "Estoque insuficiente", description: `O produto ${product.name} está esgotado.` });
        return;
      }

      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { 
          id: product.id, 
          name: product.name, 
          brand: product.brand || "Geral",
          model: product.model || "-",
          category: product.category || "Geral",
          size: product.size || "Padrão", 
          price: Number(product.price) || 0, 
          quantity: 1,
          barcode: product.barcode,
          internalCode: product.internalCode
        }];
      });
      setBarcodeInput("");
      toast({ title: "Produto adicionado", description: `${product.name}` });
    } else {
      toast({ variant: "destructive", title: "Erro", description: "Produto não encontrado." });
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products?.find(p => p.id === id);
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (product && newQty > product.quantity) {
          toast({ variant: "destructive", title: "Limite de estoque", description: `Quantidade máxima disponível: ${product.quantity}` });
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput) addToCart(barcodeInput);
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

  const finalizeSale = async () => {
    if (cart.length === 0 || !user || !firestore) return;

    setIsProcessing(true);
    
    try {
      const saleId = crypto.randomUUID();
      const saleDocRef = doc(firestore, "users", user.uid, "sales", saleId);
      const now = new Date();
      const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const saleData = {
        id: saleId,
        dateTime: now.toISOString(),
        localDate: localDate,
        createdAt: serverTimestamp(),
        totalAmount: Number(total.toFixed(2)),
        userId: user.uid,
        paymentMethod,
        saleItems: cart.map(item => ({
          productId: item.id,
          name: item.name,
          brand: item.brand,
          model: item.model,
          category: item.category,
          quantity: Number(item.quantity),
          price: Number(item.price)
        }))
      };

      const batch = writeBatch(firestore);
      batch.set(saleDocRef, saleData);

      // Baixa de estoque e registro de itens individuais
      cart.forEach(item => {
        const saleItemId = crypto.randomUUID();
        const itemRef = doc(firestore, "users", user.uid, "sales", saleId, "saleItems", saleItemId);
        batch.set(itemRef, {
          id: saleItemId,
          saleId: saleId,
          productId: item.id,
          quantity: Number(item.quantity),
          price: Number(item.price)
        });

        const productRef = doc(firestore, "products", item.id);
        const product = products?.find(p => p.id === item.id);
        if (product) {
          const newQuantity = Math.max(0, (Number(product.quantity) || 0) - Number(item.quantity));
          batch.update(productRef, { quantity: newQuantity });
        }
      });

      await batch.commit();

      setCart([]);
      toast({ 
        title: "Venda Finalizada", 
        description: `Total de R$ ${total.toFixed(2)} registrado e estoque atualizado.` 
      });
    } catch (error: any) {
      console.error("Erro ao finalizar venda:", error);
      toast({ 
        variant: "destructive", 
        title: "Erro ao processar", 
        description: error.message || "Não foi possível registrar a venda." 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2">
                <ScanBarcode className="h-6 w-6 text-primary" />
                Leitura de Código
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeSubmit} className="flex gap-4">
                <div className="relative flex-1">
                  <Input 
                    ref={inputRef}
                    placeholder="Passe o leitor de barras ou código interno..." 
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="text-lg h-12"
                    disabled={isLoadingProducts}
                    autoFocus
                  />
                  <div className="absolute right-3 top-3.5 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    ENTER para adicionar
                  </div>
                </div>
                <Button type="submit" className="h-12 px-8" disabled={isLoadingProducts}>
                  {isLoadingProducts ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
                </Button>
              </form>
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
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase">{item.brand} | {item.model}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-medium">R$ {item.price.toFixed(2)}</TableCell>
                        <TableCell className="font-bold text-sm text-primary">R$ {(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => removeItem(item.id)}>
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
              <CardTitle className="font-headline text-center text-xl">Resumo do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg opacity-80">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/20 pt-4 flex justify-between text-3xl font-bold">
                <span>TOTAL</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2 w-full">
                <Button variant="outline" onClick={() => setPaymentMethod("CARD")} className={`bg-transparent border-white/40 text-white hover:bg-white/20 flex flex-col h-16 gap-1 ${paymentMethod === "CARD" ? "bg-white/20 border-white ring-2 ring-white/50" : ""}`}>
                  <CreditCard className="h-5 w-5" />
                  <span className="text-[10px] font-bold">Cartão</span>
                </Button>
                <Button variant="outline" onClick={() => setPaymentMethod("CASH")} className={`bg-transparent border-white/40 text-white hover:bg-white/20 flex flex-col h-16 gap-1 ${paymentMethod === "CASH" ? "bg-white/20 border-white ring-2 ring-white/50" : ""}`}>
                  <Banknote className="h-5 w-5" />
                  <span className="text-[10px] font-bold">Dinheiro</span>
                </Button>
                <Button variant="outline" onClick={() => setPaymentMethod("PIX")} className={`bg-transparent border-white/40 text-white hover:bg-white/20 flex flex-col h-16 gap-1 ${paymentMethod === "PIX" ? "bg-white/20 border-white ring-2 ring-white/50" : ""}`}>
                  <QrCode className="h-5 w-5" />
                  <span className="text-[10px] font-bold">Pix</span>
                </Button>
              </div>

              <Button onClick={finalizeSale} className="w-full bg-white text-primary hover:bg-white/90 text-lg font-bold h-14" disabled={cart.length === 0 || isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <CheckCircle2 className="mr-2 h-6 w-6" />}
                FINALIZAR VENDA
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
