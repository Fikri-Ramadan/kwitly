import ResetPannel from "@/components/auth/ResetPannel";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; }>;
}) {
  const { token } = await searchParams;

  if (!token) redirect('/sign-in') 
  
  return (
    <div className="flex-1 flex">
      <ResetPannel token={token} />
    </div>
  );
}