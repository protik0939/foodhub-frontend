"use client"

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
import { useRouter } from "next/navigation"
import Image from "next/image"

export function NavAvatar() {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter();
    
    const handleLogout = async () => {
        await authClient.signOut()
        router.push("/login");
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
                    <Image src={session.user?.image ? session.user?.image : "/images/dummy-avatar.jpg"} alt={session.user?.name} height={40} width={40} className="w-10 h-10 rounded-full aspect-square"/>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-36">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/settings">Settings</Link>
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
