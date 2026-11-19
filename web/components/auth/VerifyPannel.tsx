'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { VerifEmail } from '@/lib/auth/verifEmail';
import { OpenEmailButton } from './OpenEmailButton';
import ResendButton from './ResendButton';

export default function VerifyPannel({ email, name, company }: VerifEmail) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col justify-center items-center text-black">
      <div className="w-full max-w-[392px] tracking-tight space-y-5 overflow-hidden min-h-[84px] relative mb-2.5 px-4 lg:px-0">
        <div className='mx-auto w-fit flex justify-center items-center p-4 bg-primary-tint rounded-xl lg:mx-0'>
          <Mail className='text-primary w-7 h-7' />
        </div>
        <div className="space-y-1 text-center lg:text-start">
          <h1 className="text-[28px] font-bold">Cek email Anda</h1>
          <p className="text-[15px] text-muted leading-snug">Kami mengirim tautan verifikasi ke <span className='font-semibold'>{email}</span> klik tautan itu untuk mengaktifkan akun.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className='space-y-4'>
          <OpenEmailButton email={email} />
          <ResendButton email={email} />
          <div className="mt-2 text-muted text-[13px] font-medium text-center lg:text-start">Tidak ada di kotak masuk? Periksa folder spam, atau <Link href={`/sign-up?name=${name}&company=${company}`} className="text-primary font-bold opacity-80 hover:opacity-90">ganti alamat email</Link>.</div>
        </motion.div>
      </div>
    </motion.div>
  );
}