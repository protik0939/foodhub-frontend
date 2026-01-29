import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import Link from 'next/link';
import { ModeToggle } from './ModeToggle';
import NavLogo from './NavLogo';


const logoImage = '/FoodHublogo.svg';

const navItems = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Categories',
    href: '/categories',
  },
  {
    title: 'Top Brands',
    href: '/topbrands',
  },
  {
    title: 'Cart',
    href: '/cart',
  },
];

export default function NavbarSection() {
  return (
    <nav className="mx-auto flex h-18 w-full max-w-7xl items-center gap-12 px-6 sm:px-4">
      <Link href="/" className="[&_svg]:fill-primary [&_svg]:text-primary inline-flex h-9 flex-1 items-center gap-2 text-2xl/none font-bold tracking-tight [&_svg]:size-7">
        <NavLogo />
      </Link>
      <div className="hidden gap-3 lg:inline-flex">
        {navItems.map((item) => (
          <Button key={item.title} asChild variant={'ghost'}>
            <Link href={item.href}>{item.title}</Link>
          </Button>
        ))}
      </div>
      <div className="hidden flex-1 justify-end gap-3 lg:inline-flex">
        <ModeToggle />
        <Button asChild variant={'ghost'}>
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
      <Sheet>
        <SheetTrigger asChild className="ml-auto lg:hidden">
          <Button variant="outline" size="icon" aria-label="Open Menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex w-[90%] max-w-sm flex-col px-6 py-6">
          <SheetTitle>
            <Link href="#" className="[&_svg]:fill-primary [&_svg]:text-primary inline-flex h-9 items-center gap-2 text-2xl/none font-bold tracking-tight [&_svg]:size-7">
              <Image src={logoImage} alt='FoodHub' height={40} width={150} />
            </Link>
          </SheetTitle>
          <nav className="-mx-4 my-6 flex flex-1 flex-col gap-2">
            {navItems.map((item) => (
              <Button key={item.title} asChild className="justify-start text-base" variant={'ghost'}>
                <Link href={item.href}>{item.title}</Link>
              </Button>
            ))}
          </nav>
          <div className="mt-auto grid gap-3">
            <ModeToggle />
            <Button variant={'outline'} asChild>
              <Link href="#">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="#">Get Started</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
