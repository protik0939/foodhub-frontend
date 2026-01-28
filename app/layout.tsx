import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavbarSection from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodHub",
  description: "Order-Sell-Enjoy!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="icon"
        href="/favicon.svg"
        type="image/<generated>"
        sizes="<generated>"
      />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavbarSection />
        {children}
      </body>
    </html>
  );
}
