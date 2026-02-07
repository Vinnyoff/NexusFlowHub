
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleSimulateUpload = () => {
    toast({
      title: "Processando Nota",
      description: "O sistema está lendo os dados do arquivo XML/PDF...",
    });
    
    setTimeout(() => {
      toast({
        title: "Sucesso!",
        description: "Nota importada e estoque atualizado.",
      });
    }, 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary">Importação de Notas</h1>
          <p className="text-muted-foreground">Entrada de mercadorias automática via XML ou PDF.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card 
            className={`lg:col-span-2 border-2 border-dashed transition-all ${
              isDragging ? "border-primary bg-primary/5" : "border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleSimulateUpload(); }}
          >
            <CardContent className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <FileUp className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Arraste seu arquivo aqui</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Suporte para arquivos XML de NF-e e PDFs de faturamento.
                </p>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSimulateUpload} className="gap-2">
                  <Upload className="h-4 w-4" /> Selecionar Arquivo
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
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

            <Card className="bg-primary text-white border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-headline flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Dica Nexus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs opacity-90 leading-relaxed">
                  Ao importar uma nota, o sistema cruza os produtos automaticamente pelo EAN. 
                  Itens não cadastrados serão sugeridos para criação imediata.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
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
