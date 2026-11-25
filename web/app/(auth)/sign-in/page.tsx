import LoginPannel from "@/components/auth/LoginPannel";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Suspense } from "react";

export default async function SignInPage() {
  return (
    <div className="flex-1 flex">
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPannel />
      </Suspense>
    </div>
  );
}