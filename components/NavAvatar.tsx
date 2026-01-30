"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

export function NavAvatar() {
    const { data: session, isPending } = authClient.useSession()

    const handleLogout = async () => {
        await authClient.signOut()
    }

    if (isPending) return null

    if (!session) {
        return (
            <div className="flex gap-2">
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
                    <Avatar>
                        <AvatarImage
                            src={session.user?.image || "/images/dummy-avatar.jpg"}
                            alt="Profile Photo"
                        />
                        <AvatarFallback>
                            {session.user?.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-36">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings">Settings</Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                >
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
