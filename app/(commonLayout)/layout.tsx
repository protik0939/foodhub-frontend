import { Footer } from "@/components/footer";
import NavbarSection from "@/components/Navbar";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await userService.getSession();

  if (session?.data?.user?.role === "NONE") {
    return redirect("/select-role");
  }

  if (session?.data?.user?.accountStatus === "SUSPENDED") {
    return redirect("/account-suspended");
  }

  return (
    <div>
      <NavbarSection />
      {children}
      <Footer />
    </div>
  );
}