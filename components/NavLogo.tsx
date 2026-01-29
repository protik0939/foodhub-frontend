import Image from 'next/image'

export default function NavLogo() {

  return (
    <>
      <Image
        src="/FoodHublogo.svg"
        className="dark:hidden"
        width={140}
        height={40}
        alt="FoodHub Logo"
        priority
      />
      <Image
        src="/FoodHublogoWhite.svg"
        className="hidden dark:block"
        width={140}
        height={40}
        alt="FoodHub Logo"
        priority
      />
    </>
  )
}
