import IdentitySelector from '@/components/modules/roleSelection/RoleSelection';
import { userService } from '@/services/user.service';
import React from 'react'

export const dynamic = 'force-dynamic';

export default async function page() {


  const session = await userService.getSession();

  return (
    <IdentitySelector userData={session?.data.user} />
  )
}
