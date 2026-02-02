import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
  dashboard,
}: {
  children: React.ReactNode;
  dashboard: React.ReactNode;
}) {
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
