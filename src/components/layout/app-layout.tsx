
"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { LayoutGrid, LayoutDashboard, ShoppingCart, Package, History, PieChart, LogOut, User, Sun, Moon, FileUp, Tag, Building2, ChevronRight, ClipboardList, Box, Landmark, ReceiptText, ArrowDownCircle, ArrowUpCircle, History as HistoryIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ff-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ff-theme", "light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 rounded-full text-foreground hover:bg-muted transition-all duration-300 ease-in-out hover:rotate-12"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-foreground transition-all" />
      )}
    </Button>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const isAdmin = role === "ADM";

  useEffect(() => {
    if (pathname.startsWith("/finance")) {
      setOpenSection("finance");
    } else if (pathname === "/suppliers") {
      setOpenSection("cadastro");
    } else if (pathname.startsWith("/products") || pathname === "/import" || pathname === "/labels") {
      setOpenSection("estoque");
    }
  }, [pathname]);

  const handleOpenChange = (section: string, isOpen: boolean) => {
    setOpenSection(isOpen ? section : null);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card shadow-xl transition-all duration-500 ease-in-out">
      <SidebarHeader className="p-4 flex items-center justify-center">
        <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0 transition-all duration-300 hover:scale-110 hover:bg-primary/20">
          <LayoutGrid className="h-6 w-6" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {/* Painel Principal */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Painel" className="transition-all duration-200">
              <a href="/dashboard">
                <LayoutDashboard className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Painel</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* PDV */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/pos"} tooltip="PDV" className="transition-all duration-200">
              <a href="/pos">
                <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Frente de Caixa (PDV)</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Módulo Financeiro */}
          {isAdmin && (
            <Collapsible 
              asChild 
              open={openSection === "finance"} 
              onOpenChange={(open) => handleOpenChange("finance", open)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Financeiro" className="w-full transition-all duration-200">
                    <Landmark className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-semibold">Financeiro</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                  <SidebarMenuSub className="transition-all duration-300">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/finance/payable"} className="transition-all duration-200">
                        <a href="/finance/payable" className="flex items-center gap-2">
                          <ArrowDownCircle className="h-4 w-4 text-destructive" />
                          Contas a Pagar
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/finance/receivable"} className="transition-all duration-200">
                        <a href="/finance/receivable" className="flex items-center gap-2">
                          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                          Contas a Receber
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/finance/transactions"} className="transition-all duration-200">
                        <a href="/finance/transactions" className="flex items-center gap-2">
                          <HistoryIcon className="h-4 w-4" />
                          Movimentação
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}

          {/* Módulo de Cadastro */}
          {isAdmin && (
            <Collapsible 
              asChild 
              open={openSection === "cadastro"} 
              onOpenChange={(open) => handleOpenChange("cadastro", open)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Cadastro" className="w-full transition-all duration-200">
                    <ClipboardList className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-semibold">Cadastro</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/suppliers"} className="transition-all duration-200">
                        <a href="/suppliers" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Fornecedores
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}

          {/* Módulo de Estoque */}
          {isAdmin && (
            <Collapsible 
              asChild 
              open={openSection === "estoque"} 
              onOpenChange={(open) => handleOpenChange("estoque", open)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Estoque" className="w-full transition-all duration-200">
                    <Package className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-semibold">Estoque</span>
                    <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/products"} className="transition-all duration-200">
                        <a href="/products" className="flex items-center gap-2">
                          <Box className="h-4 w-4" />
                          Central de estoque
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/import"} className="transition-all duration-200">
                        <a href="/import" className="flex items-center gap-2">
                          <FileUp className="h-4 w-4" />
                          Importação de Notas
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton asChild isActive={pathname === "/labels"} className="transition-all duration-200">
                        <a href="/labels" className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Emissão de Etiquetas
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )}

          {/* Histórico */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/history"} tooltip="Histórico" className="transition-all duration-200">
              <a href="/history">
                <History className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Histórico de Vendas</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Análise */}
          {isAdmin && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/reports"} tooltip="Análise" className="transition-all duration-200">
                <a href="/reports">
                  <PieChart className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <span className="font-semibold">Análise de Dados</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-border mt-auto flex flex-col items-center gap-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 transition-all duration-300 hover:rotate-12 hover:bg-primary/20">
          <User className="h-5 w-5 text-primary" />
        </div>
        <SidebarMenuButton 
          onClick={() => {
            logout();
            window.location.href = "/";
          }} 
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl h-11 flex justify-center w-full transition-all duration-300"
          tooltip="Sair"
        >
          <LogOut className="h-5 w-5" />
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col transition-all duration-500 ease-in-out">
        <header className="flex h-14 items-center px-4 md:px-6 gap-4 sticky top-0 bg-card border-b border-border z-20 shadow-sm transition-all duration-300">
          <SidebarTrigger className="text-primary hover:bg-primary/10 transition-colors" />
          <div className="flex items-center gap-2 transition-all duration-300">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="font-headline font-bold text-foreground tracking-tight text-lg hidden sm:inline-block">NexusFlow</span>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
