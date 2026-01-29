import NavbarSection from "@/components/Navbar";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <NavbarSection />
      {children}
    </div>
  );
}