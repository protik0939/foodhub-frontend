import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";

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
            <div className="lg:hidden mb-4">
              <SidebarTrigger className="p-2" />
            </div>
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
