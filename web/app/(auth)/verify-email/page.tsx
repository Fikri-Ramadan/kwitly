import VerifyPannel from "@/components/auth/VerifyPannel";
import { getVerifEmail } from "@/lib/auth/verifEmail";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const verifEmailData = await getVerifEmail();
  if (!verifEmailData?.email) {
    redirect('/sign-up');
  }

  return (
    <div className="flex flex-1">
      <VerifyPannel email={verifEmailData.email} name={verifEmailData.name} company={verifEmailData?.company} />
    </div>
  );
};