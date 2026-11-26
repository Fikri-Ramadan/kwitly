import LoginPannel from "@/components/auth/LoginPannel";
import { TokenError } from "@/lib/definitions";

export type LoginTabType = 'password' | 'magiclink';
export type LoginSearchType = {
  tab?: LoginTabType;
  error?: TokenError;
  next?: string;
};

export default async function SignInPage({ searchParams }: {
  searchParams: Promise<LoginSearchType>;
}) {
  const { tab, error, next } = await searchParams;

  return (
    <div className="flex-1 flex">
      <LoginPannel tab={tab} error={error} next={next} />
    </div>
  );
}