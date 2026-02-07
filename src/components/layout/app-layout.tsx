"use client";

import { useState, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from "@/components/ui/sidebar";
import { LayoutGrid, LayoutDashboard, ShoppingCart, Package, History, PieChart, LogOut, User, Sun, Moon } from "lucide-react";
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
      className="h-8 w-8 rounded-full text-white hover:bg-white/10"
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-white" />
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
    { title: "PDV", icon: ShoppingCart, url: "/pos", roles: ["ADM", "CASHIER"] },
    { title: "Inventário", icon: Package, url: "/products", roles: ["ADM"] },
    { title: "Histórico", icon: History, url: "/history", roles: ["ADM", "CASHIER"] },
    { title: "Análise", icon: PieChart, url: "/reports", roles: ["ADM"] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role || "CASHIER"));

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-primary shadow-2xl">
      <SidebarHeader className="p-4 flex items-center justify-center overflow-hidden">
        <div className="bg-white/10 p-2 rounded-xl text-white shrink-0">
          <LayoutGrid className="h-6 w-6" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} className="rounded-xl h-11 flex justify-center hover:bg-white/10 data-[active=true]:bg-accent data-[active=true]:text-white">
                <a href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-white" />
                  <span className="font-semibold group-data-[collapsible=icon]:hidden text-white">{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-white/10 mt-auto overflow-hidden flex flex-col items-center gap-4">
        <div className="flex items-center justify-center w-full">
          <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
        <SidebarMenuButton 
          onClick={() => {
            logout();
            window.location.href = "/";
          }} 
          className="text-white hover:bg-destructive/20 rounded-xl h-11 flex justify-center w-full"
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
      <SidebarInset className="bg-background">
        <header className="flex h-14 items-center px-6 gap-4 sticky top-0 bg-primary text-white z-10 shadow-md">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5 text-white" />
            <span className="font-headline font-bold text-white tracking-tight text-lg">NexusFlow</span>
          </div>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}