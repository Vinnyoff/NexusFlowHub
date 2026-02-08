
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, TrendingUp, TrendingDown, Landmark, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";

export default function FinancialTransactions() {
  const firestore = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "financialTransactions"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  const totalPayable = transactions?.filter(t => t.type === 'PAYABLE' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0) || 0;
  const totalReceivable = transactions?.filter(t => t.type === 'RECEIVABLE' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0) || 0;
  const balance = totalReceivable - totalPayable;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary flex items-center gap-2">
            <History className="h-8 w-8" /> Movimentação Financeira
          </h1>
          <p className="text-muted-foreground">Fluxo de caixa consolidado e histórico de transações pagas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Total Recebido" 
            value={`R$ ${totalReceivable.toFixed(2)}`} 
            icon={ArrowUpCircle} 
            color="text-emerald-500" 
            bgColor="bg-emerald-50"
          />
          <StatCard 
            title="Total Pago" 
            value={`R$ ${totalPayable.toFixed(2)}`} 
            icon={ArrowDownCircle} 
            color="text-destructive" 
            bgColor="bg-red-50"
          />
          <StatCard 
            title="Saldo Líquido" 
            value={`R$ ${balance.toFixed(2)}`} 
            icon={Landmark} 
            color={balance >= 0 ? "text-primary" : "text-destructive"} 
            bgColor="bg-primary/10"
          />
        </div>

        <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/10 border-b">
            <CardTitle className="text-lg font-headline">Histórico Consolidado</CardTitle>
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
                    <TableHead>Data Op.</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Favorecido/Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((t) => (
                    <TableRow key={t.id} className={t.status !== 'PAID' ? "opacity-50" : ""}>
                      <TableCell className="text-xs">
                        {new Date(t.createdAt || t.paymentDate || t.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">{t.description}</TableCell>
                      <TableCell>{t.entityName || "---"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={t.type === 'RECEIVABLE' ? 'text-emerald-500 border-emerald-500' : 'text-destructive border-destructive'}>
                          {t.type === 'RECEIVABLE' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`font-bold ${t.type === 'RECEIVABLE' ? 'text-emerald-600' : 'text-destructive'}`}>
                        {t.type === 'RECEIVABLE' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground opacity-30">
                        Nenhuma movimentação registrada.
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

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div className={`${bgColor} ${color} p-3 rounded-xl`}>
          <Icon className="h-8 w-8" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
          <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
        </div>
      </CardContent>
    </Card>
  );
}
