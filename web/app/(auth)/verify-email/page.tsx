import { verifyEmail } from "@/actions/auth";
import VerifyPannel from "@/components/auth/VerifyPannel";
import VerifyTokenClient from "@/components/auth/VerifyTokenClient";
import { toast } from "@/components/ui/toast";
import { getVerifEmail } from "@/lib/auth/verifEmail";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; }>;
}) {
  const { token } = await searchParams;

  if (token) return <VerifyTokenClient token={token} />;

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