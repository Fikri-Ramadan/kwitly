'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { resendVerificationMail } from '@/actions/auth';
import { toast } from '../ui/toast';

const DAILY_THRESHOLD = 60; // seconds di atas ini = limit harian

export default function ResendButton({ email }: { email: string }) {
  const [seconds, setSeconds] = useState(0);
  const [dailyLimited, setDailyLimited] = useState(false);
  const [sending, setSending] = useState(true); // true karena auto-send saat mount
  const didAutoSend = useRef(false);

  const send = useCallback(
    async (auto: boolean) => {
      setSending(true);

      const res = await resendVerificationMail(email);
      setSending(false);

      // sukses (60) atau 429: selalu sinkronkan cooldown dari backend
      if (res.seconds !== undefined) {
        if (res.seconds > DAILY_THRESHOLD) setDailyLimited(true);
        else setSeconds(res.seconds);
      }

      // auto-send: diam saja kalau sukses atau kena rate limit
      const rateLimited = !res.success && res.seconds !== undefined;
      if (auto && (res.success || rateLimited)) return;

      toast.add({
        title: res.message,
        type: res.success ? 'success' : 'error',
      });
    },
    [email, toast],
  );

  // kirim otomatis sekali saat halaman dibuka
  useEffect(() => {
    if (didAutoSend.current) return;
    didAutoSend.current = true;
    void send(true);
  }, [send]);

  // countdown
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const label = dailyLimited
    ? 'Batas kirim hari ini tercapai'
    : sending
      ? 'Mengirim...'
      : seconds > 0
        ? `Kirim ulang dalam ${seconds} detik`
        : 'Kirim ulang';

  return (
    <Button
      variant="outline"
      className="w-full py-6! font-bold text-black/60"
      disabled={sending || seconds > 0 || dailyLimited}
      onClick={() => send(false)}
    >
      {label}
    </Button>
  );
}