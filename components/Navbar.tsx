"use client";

import { useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, Sparkles } from "lucide-react";

import {
  SheetClose,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

type NavbarSectionProps = {
  initialUser?: TUser | null;
};

const subscribe = () => () => {};

export default function NavbarSection({ initialUser = null }: Readonly<NavbarSectionProps>) {
  const { data: session } = authClient.useSession();
  const isHydrated = useSyncExternalStore(subscribe, () => true, () => false);
  const [isExploreMoreOpen, setIsExploreMoreOpen] = useState(false);

  const resolvedUser = isHydrated
    ? ((session?.user as TUser | undefined) ?? undefined)
    : (initialUser ?? undefined);
  const userRole = resolvedUser?.role;
  const hasSession = isHydrated ? Boolean(session?.user) : Boolean(initialUser);

  if (userRole === "ADMIN") {
    return null;
  }
  const displayNavItems = hasSession ? loggedInRoutes : loggedOutRoutes;
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

            <DropdownMenu open={isExploreMoreOpen} onOpenChange={setIsExploreMoreOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 cursor-pointer"
                  aria-expanded={isExploreMoreOpen}
                  onMouseEnter={() => setIsExploreMoreOpen(true)}
                  onMouseLeave={() => setIsExploreMoreOpen(false)}
                >
                  <Sparkles className="size-4" />
                  Explore More
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      isExploreMoreOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56"
                onMouseEnter={() => setIsExploreMoreOpen(true)}
                onMouseLeave={() => setIsExploreMoreOpen(false)}
              >
                {displayNavItems.slice(5).map((item) => (
                  <DropdownMenuItem key={item.title} asChild className="cursor-pointer">
                    <Link href={item.href} className="cursor-pointer">
                      {item.title}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/privacy" className="cursor-pointer">
                    Privacy
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <div className="flex flex-1 justify-end gap-3">
          <ModeToggle />
          <NavAvatar initialUser={initialUser} />
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

              {hasSession && resolvedUser ? (
                <SheetClose asChild>
                  <Link
                    href="/profile"
                    className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card/70 px-3 py-3 transition-colors hover:bg-muted"
                  >
                    <Avatar className="size-10">
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
                    <div>
                      <p className="text-sm font-semibold leading-tight">{resolvedUser.name}</p>
                      <p className="text-xs text-muted-foreground">Tap to view profile</p>
                    </div>
                  </Link>
                </SheetClose>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <SheetClose asChild>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Log in</Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </SheetClose>
                </div>
              )}

              <nav className="-mx-4 my-6 flex flex-1 flex-col gap-1">
                {displayNavItems.map((item) => (
                  <SheetClose key={item.title} asChild>
                    <Button
                      asChild
                      className="justify-start text-base"
                      variant="ghost"
                    >
                      <Link href={item.href}>{item.title}</Link>
                    </Button>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Button asChild className="justify-start text-base" variant="ghost">
                    <Link href="/privacy">Privacy</Link>
                  </Button>
                </SheetClose>
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </nav>
    </header>
  );
}
