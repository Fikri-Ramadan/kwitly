'use client';

import Link from "next/link";
import { Button } from "../ui/button";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { motion } from 'framer-motion';

export default function RegisterPannel() {
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
            <h1 className="text-[28px] font-bold">Buat akun Kwitly</h1>
            <p className="text-[15px] text-muted leading-snug">Mulai kirim invoice profesional dalam hitungan menit.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-4"
          >

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Nama Lengkap</FieldLabel>
              <InputGroup className="py-5 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  type="text"
                  placeholder="Nama Anda"
                />
              </InputGroup>
            </Field>

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Perusahaan (opsional)</FieldLabel>
              <InputGroup className="py-5 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  type="text"
                  placeholder="Nama usaha"
                />
              </InputGroup>
            </Field>

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

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Password</FieldLabel>
              <InputGroup className="py-5 -mb-1 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  type="password"
                  placeholder="Minimal 8 karakter"
                />
              </InputGroup>
              <FieldDescription className="text-[13px]">
                Gunakan huruf besar, huruf kecil, dan angka.
              </FieldDescription>
            </Field>

            <div className="space-y-2">
              <Button className={'w-full py-6! font-bold'}>Buat akun</Button>
              <div className="text-center mt-2 text-muted font-medium">Sudah punya akun? <Link href={'/sign-in'} className="text-primary font-bold opacity-80 hover:opacity-90">Masuk</Link></div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}