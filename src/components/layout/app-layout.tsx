
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { Shirt, LayoutDashboard, ShoppingCart, Package, History, PieChart, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/app/lib/auth-store";

function AppSidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const isAdmin = role === "ADM";

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard", roles: ["ADM", "CASHIER"] },
    { title: "Caixa / PDV", icon: ShoppingCart, url: "/pos", roles: ["ADM", "CASHIER"] },
    { title: "Produtos", icon: Package, url: "/products", roles: ["ADM", "CASHIER"] },
    { title: "Histórico", icon: History, url: "/history", roles: ["ADM", "CASHIER"] },
    { title: "Relatórios", icon: PieChart, url: "/reports", roles: ["ADM"] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role || "CASHIER"));

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 flex items-center gap-3 overflow-hidden">
        <div className="bg-primary p-2 rounded-xl text-white shrink-0">
          <Shirt className="h-6 w-6" />
        </div>
        <span className="font-headline font-bold text-xl text-primary truncate group-data-[collapsible=icon]:hidden">FashionFlow</span>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {visibleItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border mt-auto overflow-hidden">
        <div className="flex items-center gap-3 mb-4 px-2 group-data-[collapsible=icon]:px-0">
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate max-w-[120px]">
              {isAdmin ? "Administrador" : "Caixa 01"}
            </span>
            <span className="text-xs text-muted-foreground">{role}</span>
          </div>
        </div>
        <SidebarMenuButton 
          onClick={() => window.location.href = "/"} 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          tooltip="Sair"
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sair</span>
        </SidebarMenuButton>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-16 items-center border-b px-4 gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="font-headline font-semibold text-lg">FashionFlow Management</h2>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}
