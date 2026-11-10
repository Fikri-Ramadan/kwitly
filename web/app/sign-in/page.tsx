import BrandPannel from "@/components/BrandPannel";
import LoginPannel from "@/components/LoginPannel";

export default function SignInPage() {
  return (
    <div className="flex-1 min-h-screen flex font-sans">
      <BrandPannel />
      <LoginPannel />
    </div>
  );
}