import { userService } from "@/services/user.service";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const session = await userService.getSession();

  if(session?.data?.user?.role === "NONE")
  {
    return redirect("/select-role");
  }

  return (
    <div>
      {children}
    </div>
  );
}