import { Footer } from "@/components/footer";
import FoodHubChatbot from "@/components/modules/ai/FoodHubChatbot";
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
    <div className="min-h-screen">
      <NavbarSection />
      <main>{children}</main>
      <Footer />
      <FoodHubChatbot />
    </div>
  );
}