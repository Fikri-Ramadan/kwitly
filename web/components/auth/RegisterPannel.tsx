'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { motion } from 'framer-motion';
import Logo from "../Logo";
import { SubmitEvent, useActionState, useEffect, useState } from "react";
import { signUp } from "@/actions/auth";
import { toast } from "../ui/toast";
import { useRouter } from "next/navigation";
import { FormState } from "@/lib/definitions";

interface RegisterPannelProps {
  initialValues?: {
    name?: string;
    company?: string;
  };
}

export default function RegisterPannel({ initialValues }: RegisterPannelProps) {
  const router = useRouter();

  // const [state, formAction, isPending] = useActionState(signUp, undefined);
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsPending(true);

    const toastId = toast.add({
      title: 'Membuat akun...',
      description: 'Mohon tunggu sebentar.',
      type: 'loading',
    });

    const result = await signUp(state, formData);
    setState(result);
    setIsPending(false);

    if (result?.errors) {
      toast.close(toastId);
      return;
    }

    if (!result?.success) {
      toast.update(toastId, {
        title: 'Pendaftaran gagal',
        description: result?.message || 'Terjadi kesalahan pada server.',
        type: 'error',
      });
      return;
    }

    toast.update(toastId, {
      title: result.message || 'Akun berhasil dibuat.',
      description: 'Beralihkan ke halaman verifikasi email...',
      type: 'success',
    });

    router.push('/verify-email');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col justify-center items-center text-black">
      <Link href={'/'} className="lg:hidden mx-auto mb-3">
        <Logo />
      </Link>
      <div className="w-full max-w-[392px] tracking-tight space-y-4 overflow-hidden min-h-[84px] relative mb-2.5 px-4 lg:px-0">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="space-y-1 text-center lg:text-start">
          <h1 className="text-[28px] font-bold">Buat akun Kwitly</h1>
          <p className="text-[15px] text-muted leading-snug">Mulai kirim invoice profesional dalam hitungan menit.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >

          <form
            // action={formAction}
            onSubmit={handleSubmit}
            className="space-y-4">
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

            <div className="flex flex-col gap-4 lg:flex-row lg:gap-3">
              <Field className="lg:max-w-1/2 max-w-full">
                <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Nama Lengkap</FieldLabel>
                <InputGroup className="py-5 border-2 border-line">
                  <InputGroupInput
                    id="inline-end-input"
                    name="name"
                    type="text"
                    placeholder="Nama Anda"
                    defaultValue={initialValues?.name ?? state?.inputs?.name ?? ''}
                    disabled={isPending}
                  />
                </InputGroup>
              </Field>

              <Field className="lg:max-w-1/2 max-w-full">
                <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Perusahaan (opsional)</FieldLabel>
                <InputGroup className="py-5 border-2 border-line">
                  <InputGroupInput
                    id="inline-end-input"
                    name="company"
                    type="text"
                    placeholder="Nama usaha"
                    defaultValue={initialValues?.company ?? state?.inputs?.company ?? ''}
                    disabled={isPending}
                  />
                </InputGroup>
              </Field>
            </div>


            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Email</FieldLabel>
              <InputGroup className="py-5 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  name="email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  defaultValue={state?.inputs?.email ?? ''}
                  disabled={isPending}
                />
              </InputGroup>
            </Field>

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Password</FieldLabel>
              <InputGroup className="py-5 -mb-1 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  disabled={isPending}
                />
              </InputGroup>
              <FieldDescription className="text-[13px]">
                Gunakan huruf besar, huruf kecil, dan angka.
              </FieldDescription>
            </Field>

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Konfirmasi Password</FieldLabel>
              <InputGroup className="py-5 -mb-1 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  name="confirmPassword"
                  type="password"
                  placeholder="Ulangi password"
                  disabled={isPending}
                />
              </InputGroup>
            </Field>

            <div className="space-y-2">
              <Button type="submit" disabled={isPending} className={`w-full py-6! font-bold ${isPending ? 'animate-pulse' : ''}`}>Buat akun</Button>
              <div className="text-sm text-center mt-2 text-muted font-medium">Sudah punya akun? <Link href={'/sign-in'} className="text-primary font-bold opacity-80 hover:opacity-90">Masuk</Link></div>
            </div>
          </form>

        </motion.div>
      </div >
    </motion.div >
  );
}