import BrandPannel from "@/components/auth/BrandPannel";
import VerifyPannel from "@/components/auth/VerifyPannel";

export default function VerifyEmailPage() {
  return (
    <div className="flex-1 flex min-h-screen font-sans">
      <BrandPannel />
      <VerifyPannel />
    </div>
  )
}