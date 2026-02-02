import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import NavLogo from "./NavLogo"
import { userService } from "@/services/user.service";
import { LayoutDashboard, Users, ShoppingBag, Store, UtensilsCrossed, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

async function getStats() {
    return {
        totalUsers: 1234,
        totalOrders: 5678,
        totalRestaurants: 89,
        totalMenuItems: 456,
    };
}

const menuItems = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Users",
        url: "/admin/users",
        icon: Users,
        count: "totalUsers"
    },
    {
        title: "Orders",
        url: "/admin/orders",
        icon: ShoppingBag,
        count: "totalOrders"
    },
    {
        title: "Restaurants",
        url: "/admin/restaurants",
        icon: Store,
        count: "totalRestaurants"
    },
    {
        title: "Menu Items",
        url: "/admin/menu-items",
        icon: UtensilsCrossed,
        count: "totalMenuItems"
    },
];

export async function AppSidebar() {
    const data = await userService.getSession();
    const stats = await getStats();

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="w-full flex flex-col items-center justify-center p-4 space-y-2">
                    <NavLogo />
                    <h2 className="text-lg font-bold">Admin Panel</h2>
                    <h4 className="text-sm text-muted-foreground">Welcome {data?.data?.user?.name}</h4>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                            {item.count && (
                                                <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                    {stats[item.count as keyof typeof stats]}
                                                </span>
                                            )}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4">
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/">
                            <LogOut className="h-4 w-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}