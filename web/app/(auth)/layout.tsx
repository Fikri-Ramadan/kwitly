import BrandPannel from "@/components/auth/BrandPannel";

export default function AuthLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex-1 min-h-screen flex font-sans">
      <BrandPannel />
      {children}
    </div>
  );
}