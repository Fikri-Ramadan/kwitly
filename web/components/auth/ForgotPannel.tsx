'use client';

import { motion } from "framer-motion";
import { Field, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { Button } from "../ui/button";
import Link from "next/link";
import Logo from "../Logo";
import { SubmitEvent, useState } from "react";
import { FormState } from "@/lib/definitions";
import { toast } from "../ui/toast";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPannel() {
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsPending(true);
    const toastId = toast.add({
      title: 'Mengirim link ke email...',
      description: 'Mohon tunggu sebentar.',
      type: 'loading',
    });

    const result = await forgotPassword(formData);
    setState(result);
    setIsPending(false);

    if (!result?.success) {
      toast.update(toastId, {
        title: 'Pengiriman link ke email gagal',
        description: result?.message || 'Terjadi kesalahan pada server.',
        type: 'error',
      });
      return;
    }

    toast.update(toastId, {
      title: result.message || 'Link berhasil terkirim ke email',
      description: 'tautan tersebut hanya berlaku 1 jam.',
      type: 'success',
    });

    form.reset();
    setState(undefined);
  };

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
          <h1 className="text-[28px] font-bold">Lupa password?</h1>
          <p className="text-[15px] text-muted leading-snug">Masukan email akun Anda. Jika terdaftar, kami kirim tautan untuk mengatur ulang password.</p>
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

            <div className="space-y-2">
              <Button type="submit" className={`w-full py-6! font-bold ${isPending ? 'animate-pulse' : ''}`} disabled={isPending}>Kirim tautan reset</Button>
              <div className="text-sm text-center mt-2 text-muted font-medium">Ingat password Anda? <Link href={'/sign-in'} className="text-primary font-bold opacity-80 hover:opacity-90">Kembali masuk</Link></div>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}