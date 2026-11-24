import BrandPannel from "@/components/auth/BrandPannel";
import Navbar from "@/components/landing/Navbar";

export default function AuthLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 min-h-screen flex font-sans flex-col">
      <div className="lg:hidden sticky top-0 z-40">
        <Navbar />
      </div>
      <div className="flex-1 flex">
        <BrandPannel />
        {children}
      </div>
    </div>
  );
}