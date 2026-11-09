import BrandPannel from "@/components/BrandPannel";
import LoginPannel from "@/components/LoginPannel";

export default function Page() {
  return (
    <div className="flex-1 min-h-screen flex font-sans text-white">
      <BrandPannel />
      <LoginPannel />
    </div>
  );
}