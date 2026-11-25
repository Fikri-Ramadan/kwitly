'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { SubmitEvent, useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "../ui/button";
import Link from "next/link";
import { FormState } from "@/lib/definitions";
import { toast } from "../ui/toast";
import { requestMagicLink, signIn } from "@/actions/auth";
import { Ellipsis } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeNext } from "@/lib/utils";

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
      className="flex-1 w-full flex flex-col justify-center items-center text-black">
      <AnimatePresence mode="wait">
        <div
          className="w-full max-w-[392px] tracking-tight space-y-1 overflow-hidden min-h-[84px] relative mb-2.5 px-4 lg:px-0"
        >
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-1 text-center lg:text-start"
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
        </div>
      </AnimatePresence>

      <LoginTabs activeTab={activeTab} setActiveTab={setActiveTab} />
    </motion.div>
  );
}

function LoginTabs({ activeTab, setActiveTab }: LoginTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-[392px] px-4 lg:px-0">
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
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState<boolean>(false);
  const router = useRouter();
  const searhParams = useSearchParams();

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsPending(true);
    const toastId = toast.add({
      title: 'Sedang masuk ke akun...',
      description: 'Memverifikasi kredensial Anda.',
      type: 'loading',
    });

    const result = await signIn(formData);
    setState(result);
    setIsPending(false);

    if (!result?.success) {
      toast.update(toastId, {
        title: 'Login gagal',
        description: result?.message || 'Terjadi kesalahan pada server.',
        type: 'error',
      });
      return;
    }

    toast.update(toastId, {
      title: result.message,
      description: 'Beralih halaman...',
      type: 'success',
    });

    return router.replace(safeNext(searhParams.get('next')));
  };

  return (
    <TabsContent value="password">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">
            Email
          </FieldLabel>
          <InputGroup className="py-1">
            <InputGroupInput
              id="inline-end-input"
              type="email"
              name="email"
              placeholder="nama@perusahaan.com"
              defaultValue={state?.inputs?.email ?? ''}
              disabled={isPending}
            />
          </InputGroup>
        </Field>
        <Field className="max-w-full">
          <FieldLabel htmlFor="inline-end-input" className="font-semibold -mb-1">Password</FieldLabel>
          <InputGroup className="py-1">
            <InputGroupInput
              id="inline-end-input"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Masukkan password"
            />
          </InputGroup>
          <FieldDescription className="text-end text-primary font-semibold">
            <Link href={'/forgot-password'} className="no-underline! opacity-80 hover:opacity-90">Lupa password?</Link>
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" className={'w-full py-6! font-bold'} disabled={isPending}>
            {isPending ? <Ellipsis className="size-6 animate-pulse" /> : 'Masuk'}
          </Button>
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
          <div className="text-center mt-2 text-muted font-medium">Belum punya akun? <Link href={'/sign-up'} className="text-primary font-bold opacity-80 hover:opacity-90">Daftar</Link></div>
        </Field>
      </form>

    </TabsContent>
  );
}

function TabsMagicLink({ setActiveTab }: Omit<LoginTabsProps, 'activeTab'>) {
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState(false);
  const searhParams = useSearchParams();

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

    const result = await requestMagicLink(formData, safeNext(searhParams.get('next')));
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
      description: 'tautan tersebut hanya berlaku 15 menit.',
      type: 'success',
    });

    form.reset();
  };

  return (
    <TabsContent value="magiclink">
      <form onSubmit={handleSubmit} className="space-y-4">
        {state?.success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            <p className="text-center">{state?.message}</p>
          </div>
        )}
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
          <InputGroup className="py-1">
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
        <Field>
          <Button type="submit" className={`w-full py-6! font-bold`} disabled={isPending}>
            {isPending ? <Ellipsis className="size-6 animate-pulse" /> : 'Masuk'}
          </Button>
          <div className="text-[12px] text-center mt-1 text-muted font-medium lg:text-sm">
            Lebih suka pakai password?{' '}
            <Button
              variant={'ghost'}
              className='text-[12px] text-primary font-bold px-0 hover:bg-transparent hover:text-primary hover:opacity-90 lg:text-sm'
              onClick={() => { setActiveTab('password'); }}
            >
              Masuk dengan password
            </Button>
          </div>
        </Field>
      </form>
    </TabsContent>
  );
}