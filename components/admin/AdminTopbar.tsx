"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, LogOut, UserCircle2 } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { logoutEverywhere } from "@/lib/logout-helper";
import type { TUser } from "@/types/user.type";

type AdminTopbarProps = {
  initialUser?: TUser | null;
};

const subscribe = () => () => {};

export default function AdminTopbar({ initialUser = null }: Readonly<AdminTopbarProps>) {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);

  const resolvedUser = isHydrated
    ? ((session?.user as TUser | undefined) ?? undefined)
    : (initialUser ?? undefined);

  const userName = resolvedUser?.name || "Admin";

  const handleLogout = async () => {
    await logoutEverywhere({
      onAfter: () => router.push("/login"),
    });
  };

  return (
    <header className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 p-3">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="p-2 lg:hidden" />
        <div>
          <h1 className="text-lg font-semibold">Admin Workspace</h1>
          <p className="text-xs text-muted-foreground">Manage customers, providers, orders, and platform health</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-2 rounded-full px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={resolvedUser?.image || ""} alt={userName} />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-28 truncate text-sm font-medium md:inline">{userName}</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile">
                <UserCircle2 className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/admin">
                <Home className="mr-2 h-4 w-4" /> Dashboard Home
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/">Back to Website</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
