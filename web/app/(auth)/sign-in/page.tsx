import BrandPannel from "@/components/auth/BrandPannel";
import LoginPannel from "@/components/auth/LoginPannel";

export default function SignInPage() {
  return (
    <div className="flex-1 min-h-screen flex font-sans">
      <BrandPannel />
      <LoginPannel />
    </div>
  );
}