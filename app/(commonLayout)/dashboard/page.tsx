import RoleDashboard from "@/components/modules/dashboard/RoleDashboard";
import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await userService.getSession();

  if (!session?.data?.user) {
    redirect("/login");
  }

  const role = session.data.user.role;

  if (role === "NONE") {
    redirect("/select-role");
  }

  if (role === "ADMIN") {
    redirect("/admin");
  }

  if (role === "PROVIDER") {
    redirect("/");
  }

  if (role !== "CUSTOMER" && role !== "MANAGER") {
    redirect("/");
  }

  return (
    <RoleDashboard
      role={role}
      userId={session.data.user.id}
      userName={session.data.user.name}
    />
  );
}
