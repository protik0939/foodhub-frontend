import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	FacebookIcon,
	GithubIcon,
	InstagramIcon,
	LinkedinIcon,
	TwitterIcon,
	YoutubeIcon,
} from "lucide-react";
import NavLogo from "./NavLogo";
import Link from "next/link";

export function Footer() {
	const company = [
		{ title: "About FoodHub", href: "/about" },
		{ title: "Privacy Policy", href: "/privacy" },
		{ title: "Help Center", href: "/help" },
		{ title: "Contact", href: "/contact" },
	];

	const resources = [
		{ title: "Explore Meals", href: "/explore" },
		{ title: "Top Brands", href: "/topbrands" },
		{ title: "Categories", href: "/categories" },
		{ title: "Blog", href: "/blog" },
	];

	const socialLinks = [
		{
			icon: FacebookIcon,
			link: "https://www.facebook.com",
		},
		{
			icon: GithubIcon,
			link: "https://github.com",
		},
		{
			icon: InstagramIcon,
			link: "https://www.instagram.com",
		},
		{
			icon: LinkedinIcon,
			link: "https://www.linkedin.com",
		},
		{
			icon: TwitterIcon,
			link: "https://x.com",
		},
		{
			icon: YoutubeIcon,
			link: "https://www.youtube.com",
		},
	];
	return (
		<footer className="relative mt-14 flex items-center justify-center border-t border-border/50 bg-muted/40">
			<div
				className={cn(
					"w-full",
					"dark:bg-[radial-gradient(35%_80%_at_30%_0%,--theme(--color-foreground/.1),transparent)]"
				)}
			>
				<div className="grid app-shell w-full grid-cols-6 gap-6 px-4 py-10 sm:px-6 lg:px-8">
					<div className="col-span-6 flex flex-col gap-4 md:col-span-3">
						<Link className="w-max" href="/">
							<NavLogo/>
						</Link>
						<p className="max-w-sm text-balance text-muted-foreground text-sm">
							FoodHub connects local kitchens with hungry customers through reliable delivery, transparent reviews, and real-time order tracking.
						</p>
						<div className="text-sm text-muted-foreground space-y-1">
							<p>Support: support@foodhub.com.bd</p>
							<p>Phone: +880 9612-345678</p>
							<p>Address: House 17, Road 11, Banani, Dhaka 1213, Bangladesh</p>
						</div>
						<div className="flex gap-2">
							{socialLinks.map((item, index) => (
								<Button
									key={`social-${item.link}-${index}`}
									size="icon-sm"
									variant="outline"
								>
									<a href={item.link} target="_blank" rel="noreferrer">
										<item.icon className="size-3.5" />
									</a>
								</Button>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-muted-foreground text-xs">Resources</span>
						<div className="mt-2 flex flex-col gap-2">
							{resources.map(({ href, title }) => (
								<Link
									className="w-max text-sm hover:underline"
									href={href}
									key={title}
								>
									{title}
								</Link>
							))}
						</div>
					</div>
					<div className="col-span-3 w-full md:col-span-1">
						<span className="text-muted-foreground text-xs">Company</span>
						<div className="mt-2 flex flex-col gap-2">
							{company.map(({ href, title }) => (
								<Link
									className="w-max text-sm hover:underline"
									href={href}
									key={title}
								>
									{title}
								</Link>
							))}
						</div>
					</div>
					<div className="col-span-6 w-full md:col-span-1">
						<span className="text-muted-foreground text-xs">Legal</span>
						<div className="mt-2 flex flex-col gap-2">
							<Link className="w-max text-sm hover:underline" href="/privacy">
								Privacy
							</Link>
							<Link className="w-max text-sm hover:underline" href="/help">
								Support Guidelines
							</Link>
						</div>
					</div>
				</div>
				<div className="flex w-full flex-col justify-between gap-2 border-t border-border/50 py-4">
					<p className="text-center font-light text-muted-foreground text-sm">
						&copy; {new Date().getFullYear()} FoodHub, All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	);
}
