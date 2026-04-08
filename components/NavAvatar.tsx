"use client"

import { useSyncExternalStore } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { logoutEverywhere } from "@/lib/logout-helper"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import type { TUser } from "@/types/user.type"

type NavAvatarProps = {
    initialUser?: TUser | null
}

const subscribe = () => () => {}

function getDashboardHref(role?: TUser["role"]): string {
    if (role === "ADMIN") {
        return "/admin"
    }

    if (role === "PROVIDER") {
        return "/"
    }

    return "/dashboard"
}

export function NavAvatar({ initialUser = null }: Readonly<NavAvatarProps>) {
    const { data: session, isPending } = authClient.useSession()
    const isHydrated = useSyncExternalStore(subscribe, () => true, () => false)
    const router = useRouter();
    const resolvedUser = isHydrated
        ? ((session?.user as TUser | undefined) ?? undefined)
        : (initialUser ?? undefined)
    const role = resolvedUser?.role;
    const dashboardHref = getDashboardHref(role);
    
    const handleLogout = async () => {
        await logoutEverywhere({
            onAfter: () => router.push("/login"),
        });
    }

    if (isHydrated && isPending) return null

    if (!resolvedUser) {
        return (
            <div className="hidden gap-2 lg:flex">
                <Button asChild variant="ghost">
                    <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">Sign up</Link>
                </Button>
            </div>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={resolvedUser.image || ""} alt={resolvedUser.name} />
                        <AvatarFallback>
                            {resolvedUser.name
                                ?.split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase() || "FH"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-36">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={dashboardHref}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/help">Help Center</Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
