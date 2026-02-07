
"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, Upload, FileText, AlertCircle, CheckCircle2, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ImportPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [isConsulting, setIsConsulting] = useState(false);
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
    toast({
      title: "Consultando Sefaz",
      description: "Buscando dados da NF-e pela chave de acesso...",
    });

    setTimeout(() => {
      setIsConsulting(false);
      setAccessKey("");
      toast({
        title: "Sucesso!",
        description: "Dados da NF-e recuperados e estoque atualizado.",
      });
    }, 2500);
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
                      onChange={(e) => setAccessKey(e.target.value.replace(/\D/g, "").substring(0, 44))}
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
                  <p className="text-[10px] text-muted-foreground px-1">
                    {accessKey.length}/44 dígitos digitados
                  </p>
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
                    <Upload className="h-4 w-4" /> Selecionar Arquivo
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
                  Itens não cadastrados serão sugeridos para criação imediata.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

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
