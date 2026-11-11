import BrandPannel from "@/components/auth/BrandPannel";
import RegisterPannel from "@/components/auth/RegisterPannel";

export default function RegisterPage() {
  return (
    <div className="flex-1 min-h-screen flex font-sans">
      <BrandPannel />
      <RegisterPannel />
    </div>
  );
}