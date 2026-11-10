import BrandPannel from "@/components/BrandPannel";
import RegisterPannel from "@/components/RegisterPannel";

export default function RegisterPage() {
  return (
    <div className="flex-1 min-h-screen flex font-sans">
      <BrandPannel />
      <RegisterPannel />
    </div>
  );
}