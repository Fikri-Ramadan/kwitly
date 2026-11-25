// components/LogoutButton.tsx
'use client';

import { useTransition } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout } from '@/actions/auth';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.replace('/sign-in');
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleLogout}
      disabled={isPending}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <LogOut className="mr-2 size-4" />
      {isPending ? 'Sedang keluar...' : 'Keluar'}
    </Button>
  );
}
