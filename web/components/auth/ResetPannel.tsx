'use client';

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import Link from "next/link";
import Logo from "../Logo";
import { SubmitEvent, useState } from "react";
import { FormState } from "@/lib/definitions";
import { toast } from "../ui/toast";
import { resetPassword } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function ResetPannel({ token }: { token: string; }) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsPending(true);
    const toastId = toast.add({
      title: 'Mengatur ulang password...',
      description: 'Mohon tunggu sebentar.',
      type: 'loading',
    });

    const result = await resetPassword(formData, token);
    setState(result);
    setIsPending(false);

    if (!result?.success) {
      toast.update(toastId, {
        title: 'Kata sandi gagal diubah',
        description: result?.message || 'Terjadi kesalahan pada server.',
        type: 'error',
      });
      return;
    }

    toast.update(toastId, {
      title: result.message || 'Kata sandi berhasil disimpan',
      description: 'Beralihkan ke halaman login...',
      type: 'success',
    });

    router.push('/sign-in')
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col justify-center items-center text-black">
      <div className="w-full max-w-[392px] tracking-tight space-y-5 overflow-hidden min-h-[84px] relative mb-2.5 px-4 lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="space-y-1 text-center lg:text-start">
          <h1 className="text-[28px] font-bold">Atur password baru</h1>
          <p className="text-[15px] text-muted leading-snug">Tautan ini hanya bisa dipakai sekali. Setelah disimpan, Anda perlu masuk kembali di semua perangkat.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {state?.errors && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <ul className="list-disc pl-4 space-y-1">
                  {Object.values(state.errors)
                    .flat()
                    .map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                </ul>
              </div>
            )}

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Password baru</FieldLabel>
              <InputGroup className="py-1 -mb-1">
                <InputGroupInput
                  id="inline-end-input"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                />
              </InputGroup>
              <FieldDescription className="text-[13px]">
                Gunakan huruf besar, huruf kecil, dan angka.
              </FieldDescription>
            </Field>

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Konfirmasi password</FieldLabel>
              <InputGroup className="py-1 -mb-1">
                <InputGroupInput
                  id="inline-end-input"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password baru"
                />
              </InputGroup>
            </Field>

            <Button type="submit" className={`w-full py-6! font-bold ${isPending ? 'animate-pulse' : ''}`} disabled={isPending}>
              Simpan password baru
            </Button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}