import BrandPannel from "@/components/auth/BrandPannel";
import ResetPannel from "@/components/auth/ResetPannel";

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex min-h-screen font-sans">
      <BrandPannel />
      <ResetPannel />
    </div>
  )
}