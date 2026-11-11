'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "../ui/button";
import Link from "next/link";

interface LoginTabsProps {
  activeTab: 'password' | 'magiclink';
  setActiveTab: (tab: 'password' | 'magiclink') => void; //  Aman & Pasti terdefinisi
}

export default function LoginPannel() {
  const [activeTab, setActiveTab] = useState<'password' | 'magiclink'>("password");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex-1 flex flex-col justify-center text-black">
      <div className="mx-auto">
        <div
          className="w-[392px] tracking-tight space-y-1 overflow-hidden min-h-[84px] relative mb-2.5"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="space-y-1"
            >
              <h1 className="text-[28px] font-bold">
                {activeTab === 'password' ? 'Masuk ke Kwitly' : 'Masuk tanpa password'}
              </h1>
              <p className="text-[15px] text-muted leading-snug">
                {activeTab === 'password'
                  ? 'Selamat Datang Kembali. Kelola invoice anda.'
                  : 'Kami kirim tautan sekali pakai ke email Anda. Tautan berlaku 15 menit.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        <LoginTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </motion.div>
  );
}

function LoginTabs({ activeTab, setActiveTab }: LoginTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[392px]">
      <TabsList className={'w-full py-6 relative'}>
        <TabsTrigger
          className={'py-5.5 font-bold w-full relative z-10 transition-colors data-[state=active]:text-black text-muted-foreground hover:cursor-pointer'}
          value="password"
        >
          Password
          {activeTab === "password" && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 border"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </TabsTrigger>
        <TabsTrigger
          className={'py-5.5 font-bold w-full relative z-10 transition-colors data-[state=active]:text-black text-muted-foreground hover:cursor-pointer'}
          value="magiclink"
        >
          Magic Link
          {activeTab === "magiclink" && (
            <motion.div
              layoutId="active-pill"
              className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10 border"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </TabsTrigger>
      </TabsList>
      <div className="relative mt-2 overflow-hidden min-h-[160px]">
        <AnimatePresence mode="wait">
          {activeTab === "password" && (
            <TabsContent value="password" key="password-content">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                <TabsPassword setActiveTab={setActiveTab} />
              </motion.div>
            </TabsContent>
          )}

          {activeTab === "magiclink" && (
            <TabsContent value="magiclink" key="magiclink-content">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                <TabsMagicLink setActiveTab={setActiveTab} />
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
}

function TabsPassword({ setActiveTab }: Omit<LoginTabsProps, 'activeTab'>) {
  return (
    <TabsContent value="password" className={'space-y-4'}>
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
        <InputGroup className="py-5 border-2 border-line">
          <InputGroupInput
            id="inline-end-input"
            type="password"
            placeholder="Masukkan password"
          />
        </InputGroup>
        <FieldDescription className="text-end text-primary font-semibold">
          <Link href={'/forgot-password'} className="no-underline! opacity-80 hover:opacity-90">Lupa password?</Link>
        </FieldDescription>
      </Field>
      <Field>
        <Button className={'w-full py-6! font-bold'}>Masuk</Button>
        <div className="flex items-center my-2 w-full">
          <div className="flex-1 border-t-2 border-line"></div>
          <span className="mx-4 text-xs font-medium text-muted-foreground bg-transparent">
            atau
          </span>
          <div className="flex-1 border-t-2 border-line"></div>
        </div>
        <Button
          variant={'outline'}
          className={'w-full py-6! font-bold text-black/80'}
          onClick={() => { setActiveTab('magiclink'); }}
        >Kirim magic link ke email</Button>
        <div className="text-center mt-2 text-muted font-medium">Belum punya akun? <Link href={'/register'} className="text-primary font-bold opacity-80 hover:opacity-90">Daftar</Link></div>
      </Field>
    </TabsContent>
  );
}

function TabsMagicLink({ setActiveTab }: Omit<LoginTabsProps, 'activeTab'>) {
  return (
    <TabsContent value="magiclink" className={'space-y-4'}>
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
      <Field>
        <Button className={'w-full py-6! font-bold'}>Masuk</Button>
        <div className="text-[13px] text-center mt-1 text-muted font-medium">
          Lebih suka pakai password?{' '}
          <Button
            variant={'ghost'}
            className="text-primary font-bold px-0 hover:bg-transparent hover:text-primary hover:opacity-90"
            onClick={() => { setActiveTab('password'); }}
          >Masuk dengan password
          </Button>
        </div>
      </Field>
    </TabsContent>
  );
}