import Image from "next/image";

export default function CommonLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/authPageBackground.jpg"
          fill
          alt="food-background"
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/100 to-white/0 dark:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/100 to-black/0 hidden dark:block" />
      </div>


      {children}
    </div>
  );
}