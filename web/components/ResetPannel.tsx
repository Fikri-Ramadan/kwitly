'use client';

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Field, FieldDescription, FieldLabel } from "./ui/field";
import { InputGroup, InputGroupInput } from "./ui/input-group";

export default function ResetPannel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col justify-center text-black">
      <div className="mx-auto">
        <div className="w-[392px] tracking-tight space-y-5 overflow-hidden min-h-[84px] relative mb-2.5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-1">
            <h1 className="text-[28px] font-bold">Atur password baru</h1>
            <p className="text-[15px] text-muted leading-snug">Tautan ini hanya bisa dipakai sekali. Setelah disimpan, Anda perlu masuk kembali di semua perangkat.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-5"
          >
            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Password baru</FieldLabel>
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

            <Field className="max-w-full">
              <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Konfirmasi password</FieldLabel>
              <InputGroup className="py-5 -mb-1 border-2 border-line">
                <InputGroupInput
                  id="inline-end-input"
                  type="password"
                  placeholder="Ulangi password baru"
                />
              </InputGroup>
            </Field>

            <Button className={'w-full py-6! font-bold'}>Simpan password baru</Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}