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
        <div className="absolute inset-0 bg-linear-to-t from-white to-white/0 dark:hidden" />
        <div className="absolute inset-0 hidden bg-linear-to-t from-black to-black/0 dark:block" />
      </div>


      {children}
    </div>
  );
}