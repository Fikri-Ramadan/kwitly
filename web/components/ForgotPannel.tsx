'use client';

import { motion } from "framer-motion";
import { Field, FieldLabel } from "./ui/field";
import { InputGroup, InputGroupInput } from "./ui/input-group";
import { Button } from "./ui/button";
import Link from "next/link";

export default function ForgotPannel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col justify-center text-black">
      <div className="mx-auto">
        <div className="w-[392px] tracking-tight space-y-4 overflow-hidden min-h-[84px] relative mb-2.5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-1">
            <h1 className="text-[28px] font-bold">Lupa password?</h1>
            <p className="text-[15px] text-muted leading-snug">Masukan email akun Anda. Jika terdaftar, kami kirim tautan untuk mengatur ulang password.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-5"
          >
            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Email</FieldLabel>
              <InputGroup className="py-5 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  type="email"
                  placeholder="nama@perusahaan.com"
                />
              </InputGroup>
            </Field>

            <div className="space-y-2">
              <Button className={'w-full py-6! font-bold'}>Kirim tautan reset</Button>
              <div className="text-center mt-2 text-muted font-medium">Ingat password Anda? <Link href={'/sign-in'} className="text-primary font-bold opacity-80 hover:opacity-90">Kembali masuk</Link></div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}