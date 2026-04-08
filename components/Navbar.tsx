"use client";

import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { ModeToggle } from "./ModeToggle";
import NavLogo from "./NavLogo";
import { NavAvatar } from "./NavAvatar";
import { authClient } from "@/lib/auth-client";
import type { TUser } from "@/types/user.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const loggedOutRoutes = [
  { title: "Home", href: "/" },
  { title: "Explore", href: "/explore" },
  { title: "Categories", href: "/categories" },
  { title: "Top Brands", href: "/topbrands" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Blog", href: "/blog" },
];

const loggedInRoutes = [
  { title: "Home", href: "/" },
  { title: "Explore", href: "/explore" },
  { title: "Categories", href: "/categories" },
  { title: "Top Brands", href: "/topbrands" },
  { title: "Dashboard", href: "/dashboard" },
  { title: "Your Orders", href: "/your-orders" },
  { title: "Help", href: "/help" },
];

export default function NavbarSection() {
  const { data: session } = authClient.useSession();
  const userRole = (session?.user as TUser | undefined)?.role;

  if (userRole === "ADMIN") {
    return null;
  }
  const displayNavItems = session ? loggedInRoutes : loggedOutRoutes;
  const showNavItems = userRole !== "PROVIDER";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-md">
      <nav className="app-shell flex h-18 items-center gap-2">
        <Link
          href="/"
          className="[&_svg]:fill-primary [&_svg]:text-primary inline-flex h-9 flex-1 items-center gap-2 text-2xl/none font-bold tracking-tight [&_svg]:size-7"
        >
          <NavLogo />
        </Link>

        {showNavItems && (
          <div className="hidden items-center gap-1 lg:inline-flex">
            {displayNavItems.slice(0, 5).map((item) => (
              <Button key={item.title} asChild variant="ghost">
                <Link href={item.href}>{item.title}</Link>
              </Button>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Sparkles className="size-4" />
                  Explore More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {displayNavItems.slice(5).map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    <Link href={item.href}>{item.title}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/privacy">Privacy</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex flex-1 justify-end gap-3">
          <ModeToggle />
          <NavAvatar />
        </div>

        {showNavItems && (
          <Sheet>
            <SheetTrigger asChild className="ml-auto lg:hidden">
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-[90%] max-w-sm flex-col px-6 py-6"
            >
              <SheetTitle>
                <Link
                  href="/"
                  className="[&_svg]:fill-primary [&_svg]:text-primary inline-flex h-9 items-center gap-2 text-2xl/none font-bold tracking-tight [&_svg]:size-7"
                >
                  <NavLogo />
                </Link>
              </SheetTitle>
              <nav className="-mx-4 my-6 flex flex-1 flex-col gap-1">
                {displayNavItems.map((item) => (
                  <Button
                    key={item.title}
                    asChild
                    className="justify-start text-base"
                    variant="ghost"
                  >
                    <Link href={item.href}>{item.title}</Link>
                  </Button>
                ))}
                <Button asChild className="justify-start text-base" variant="ghost">
                  <Link href="/privacy">Privacy</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </header>
  );
}
