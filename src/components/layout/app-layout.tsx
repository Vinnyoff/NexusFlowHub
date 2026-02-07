
"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { Shirt, LayoutDashboard, ShoppingCart, Package, History, PieChart, LogOut, User, Sun, Moon } from "lucide-react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/lib/auth-store";
import { Button } from "@/components/ui/button";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

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
      className="h-8 w-8 rounded-full"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-primary" />
      )}
    </Button>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const isAdmin = role === "ADM";

  const menuItems = [
    { title: "Painel", icon: LayoutDashboard, url: "/dashboard", roles: ["ADM", "CASHIER"] },
    { title: "Caixa", icon: ShoppingCart, url: "/pos", roles: ["ADM", "CASHIER"] },
    { title: "Estoque", icon: Package, url: "/products", roles: ["ADM"] },
    { title: "Vendas", icon: History, url: "/history", roles: ["ADM", "CASHIER"] },
    { title: "Relatórios", icon: PieChart, url: "/reports", roles: ["ADM"] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role || "CASHIER"));

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar shadow-xl">
      <SidebarHeader className="p-4 flex items-center justify-center overflow-hidden">
        <div className="bg-primary p-2 rounded-xl text-white shrink-0 shadow-lg shadow-primary/20">
          <Shirt className="h-6 w-6" />
        </div>
        <span className="font-headline font-bold text-xl text-primary truncate group-data-[collapsible=icon]:hidden tracking-tight ml-3">FashionFlow</span>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} className="rounded-xl h-11 flex justify-center">
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-semibold group-data-[collapsible=icon]:hidden">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-border mt-auto overflow-hidden flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-full">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col ml-3 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold truncate max-w-[120px]">
              {isAdmin ? "Administrador" : "Caixa 01"}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-70 tracking-tighter">{role}</span>
          </div>
        </div>
        <SidebarMenuButton 
          onClick={() => {
            logout();
            window.location.href = "/";
          }} 
          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-11 flex justify-center w-full"
          tooltip="Sair"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-bold group-data-[collapsible=icon]:hidden">Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-11 items-center px-4 gap-4 sticky top-0 bg-background/60 backdrop-blur-md z-10 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Shirt className="h-4 w-4 text-primary" />
            <span className="font-headline font-bold text-primary tracking-tight text-sm">FashionFlow</span>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
