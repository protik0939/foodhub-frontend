import AdminTopbar from "@/components/admin/AdminTopbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { userService } from "@/services/user.service";
import type { TUser } from "@/types/user.type";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  dashboard,
}: {
  children: React.ReactNode;
  dashboard: React.ReactNode;
}) {

  const session = await userService.getSession();

  if (session?.data?.user?.role == "ADMIN") {
    return (
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />
          <main className="flex-1 p-6">
            <AdminTopbar initialUser={(session?.data?.user as TUser | undefined) || null} />
            {dashboard}
            {children}
          </main>
        </div>
      </SidebarProvider>
    );
  }
  else{
    return redirect("/");
  }
}
