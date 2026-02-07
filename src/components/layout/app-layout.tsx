
"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutGrid, LayoutDashboard, ShoppingCart, Package, History, PieChart, LogOut, User, Sun, Moon, FileUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-store";
import { Button } from "@/components/ui/button";

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
      className="h-8 w-8 rounded-full text-foreground hover:bg-muted"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-foreground" />
      )}
    </Button>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();

  const menuItems = [
    { title: "Painel", icon: LayoutDashboard, url: "/dashboard", roles: ["ADM", "CASHIER"] },
    { title: "PDV", icon: ShoppingCart, url: "/pos", roles: ["ADM", "CASHIER"] },
    { title: "Inventário", icon: Package, url: "/products", roles: ["ADM"] },
    { title: "Importação", icon: FileUp, url: "/import", roles: ["ADM"] },
    { title: "Histórico", icon: History, url: "/history", roles: ["ADM", "CASHIER"] },
    { title: "Análise", icon: PieChart, url: "/reports", roles: ["ADM"] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role || "CASHIER"));

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card shadow-xl transition-all duration-300">
      <SidebarHeader className="p-4 flex items-center justify-center">
        <div className="bg-primary/10 p-2 rounded-xl text-primary shrink-0 transition-transform hover:scale-110">
          <LayoutGrid className="h-6 w-6" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} className="rounded-xl h-11 hover:bg-primary/10 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground transition-all">
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-border mt-auto flex flex-col items-center gap-4">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <User className="h-5 w-5 text-primary" />
        </div>
        <SidebarMenuButton 
          onClick={() => {
            logout();
            window.location.href = "/";
          }} 
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl h-11 flex justify-center w-full transition-colors"
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
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="bg-background flex flex-col">
        <header className="flex h-14 items-center px-4 md:px-6 gap-4 sticky top-0 bg-card border-b border-border z-20 shadow-sm">
          <SidebarTrigger className="text-primary hover:bg-primary/10" />
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="font-headline font-bold text-foreground tracking-tight text-lg hidden sm:inline-block">NexusFlow</span>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
