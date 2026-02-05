import { userService } from '@/services/user.service';
import { redirect } from 'next/navigation';
import CustomerProfile from '@/components/modules/profile/CustomerProfile';
import ProviderProfile from '@/components/modules/profile/ProviderProfile';
import AdminProfile from '@/components/modules/profile/AdminProfile';

export const dynamic = 'force-dynamic';

export default async function page() {
    const session = await userService.getSession();

    if (!session?.data?.user) {
        return redirect("/login");
    }

    const role = session.data.user.role;

 
    const userProfile = null;
    const adminProfile = null; 
    const providerProfile = null;

    if (role === "CUSTOMER") {
        return <CustomerProfile session={session.data} profile={userProfile} />;
    } else if (role === "ADMIN") {
        return <AdminProfile  session={session.data} profile={adminProfile}/>;
    } else if (role === "PROVIDER") {
        return <ProviderProfile session={session.data} profile={providerProfile} />;
    }

    return redirect("/login");
}
