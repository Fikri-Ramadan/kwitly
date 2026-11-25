'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { verifyEmail } from '@/actions/auth';
import { toast } from '@/components/ui/toast';
import LoadingSpinner from '../LoadingSpinner';

export default function VerifyTokenClient({ token }: { token: string; }) {
  const router = useRouter();
  const hasCalled = useRef(false);

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    async function processToken() {
      const res = await verifyEmail(token);

      toast.add({
        title: res?.message || (res?.success ? 'Email berhasil diverifikasi' : 'Verifikasi gagal'),
        description: 'Beralih ke halaman login...',
        type: res?.success ? 'success' : 'error',
      });

      router.replace('/sign-in');
    }

    processToken();
  }, [token, router]);

  return (
    <LoadingSpinner text='Memverifikasi email Anda...' />
  );
}
