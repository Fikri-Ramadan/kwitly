import BrandPannel from "@/components/auth/BrandPannel";
import ForgotPannel from "@/components/auth/ForgotPannel";

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex min-h-screen font-sans">
      <BrandPannel />
      <ForgotPannel />
    </div>
  );
}