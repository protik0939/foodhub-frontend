import TopBrands from '@/components/modules/topBrands/page';
import { providerService } from '@/services/provider.service';
import React from 'react'

export default async function page() {

  const providers = await providerService.getAllProviders();
  console.log(providers);
  
  return (
    <TopBrands providers={providers} />
  )
}
