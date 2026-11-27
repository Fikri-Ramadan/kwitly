import BrandPannel from "@/components/auth/BrandPannel";
import Navbar from "@/components/landing/Navbar";
import { hasSession } from "@/lib/auth/session";

export default async function AuthLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const isAuth = await hasSession();
  
  return (
    <div className="flex-1 min-h-screen flex font-sans flex-col">
      <div className="lg:hidden sticky top-0 z-40">
        <Navbar isAuth={isAuth} />
      </div>
      <div className="flex-1 flex">
        <BrandPannel />
        {children}
      </div>
    </div>
  );
}