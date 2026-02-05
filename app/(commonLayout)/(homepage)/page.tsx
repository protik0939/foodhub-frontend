import CustomerPage from '@/components/modules/homepage/customer/CustomerPage';
import ProviderPage from '@/components/modules/homepage/provider/ProviderPage';
import { userService } from '@/services/user.service';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function page() {

  const session = await userService.getSession();

  const condition = session?.data?.user?.role;

  if (condition == "ADMIN") {
    return redirect("/admin");
  }

  if (condition == "PROVIDER") {
    const userId = session?.data?.user?.id;
    return <ProviderPage providerId={userId} />
  }

  return (
    <CustomerPage />
  )
}
