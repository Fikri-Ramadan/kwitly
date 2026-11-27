import Sidebar from "@/components/dashboard/Sidebar";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  if (!session) return redirect('/sign-in');

  return (
    <div className="flex-1 min-h-screen flex font-sans">
      <Sidebar fullName={session.fullName} company={session.company} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}