"use client";

import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  UtensilsCrossed,
  FolderOpen,
  User,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import NavLogo from "./NavLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
  },
  {
    title: "Providers",
    url: "/admin/providers",
    icon: Store,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Meals",
    url: "/admin/meals",
    icon: UtensilsCrossed,
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: FolderOpen,
  },
];


export function AppSidebar() {

  const { data: session } = authClient.useSession();

  return (
    <Sidebar>
      <div className="flex items-center justify-center pt-10">
        <NavLogo />
      </div>
      <SidebarHeader className="p-4">
        <h2 className="text-xl font-bold">FoodHub Admin</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
        >
          <Avatar className="h-10 w-10">
            <Image height={30} width={30} className="w-10 h-10 rounded-full" src={session?.user?.image ? session.user?.image : "/images/dummy-avatar.jpg"} alt="Admin" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{session?.user?.name}</span>
            <span className="text-xs text-muted-foreground">View Profile</span>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
