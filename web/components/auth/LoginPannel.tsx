'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import { InputGroup, InputGroupInput } from "../ui/input-group";
import { SubmitEvent, useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from "../ui/button";
import Link from "next/link";
import { FormState, tokenErrorMessage } from "@/lib/definitions";
import { toast } from "../ui/toast";
import { requestMagicLink, signIn } from "@/actions/auth";
import { Ellipsis } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { safeNext } from "@/lib/utils";
import { LoginSearchType, LoginTabType } from "@/app/(auth)/sign-in/page";


interface LoginPannelProps extends LoginSearchType { };

export default function LoginPannel({ tab = 'password', error, next }: LoginPannelProps) {
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
            key={tab}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="space-y-1 text-center lg:text-start"
          >
            <h1 className="text-[28px] font-bold">
              {tab === 'password' ? 'Masuk ke Kwitly' : 'Masuk dengan email'}
            </h1>
            <p className="text-[15px] text-muted leading-snug">
              {tab === 'password'
                ? 'Selamat Datang Kembali. Kelola invoice anda.'
                : 'Tanpa password dan tanpa registrasi manual. Cukup klik tautan sekali pakai yang kami kirim ke email Anda (berlaku 15 menit).'}
            </p>
          </motion.div>
        </div>
      </AnimatePresence>

      <LoginTabs
        tab={tab}
        error={error}
        next={next}
      />
    </motion.div>
  );
}

function LoginTabs({ tab, error, next }: LoginPannelProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (value: LoginTabType) => {
    const params = new URLSearchParams();
    params.set('tab', value);
    if (error) params.set('error', error.toString());
    if (next) params.set('next', next);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Tabs
      className="w-full max-w-[392px] px-4 lg:px-0"
      value={tab}
      onValueChange={handleChange}
    >
      <TabsList className={'w-full py-6 relative'}>
        <TabsTrigger
          className={'py-5.5 font-bold w-full relative z-10 transition-colors data-[state=active]:text-black text-muted-foreground hover:cursor-pointer'}
          value="password"
        >
          Password
          {tab === "password" && (
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
          {tab === "magiclink" && (
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
          {tab === "password" && (
            <TabsContent value="password" key="password-content">
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                <TabsPassword tab={tab} next={next} />
              </motion.div>
            </TabsContent>
          )}

          {tab === "magiclink" && (
            <TabsContent value="magiclink" key="magiclink-content">
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                <TabsMagicLink tab={tab} error={error} next={next} />
              </motion.div>
            </TabsContent>
          )}
        </AnimatePresence>
      </div>
    </Tabs>
  );
}

function TabsPassword({ tab, error, next }: LoginPannelProps) {
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

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

    return router.replace(safeNext(next));
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
            onClick={() => {
              const params = new URLSearchParams();
              if (tab) params.set('tab', tab);
              if (error) params.set('error', error.toString());
              if (next) params.set('next', next);

              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
          >Kirim magic link ke email</Button>
          <div className="text-center mt-2 text-muted font-medium">Belum punya akun? <Link href={'/sign-up'} className="text-primary font-bold opacity-80 hover:opacity-90">Daftar</Link></div>
        </Field>
      </form>

    </TabsContent>
  );
}

function TabsMagicLink({ tab, error, next }: LoginPannelProps) {
  const [state, setState] = useState<FormState>(undefined);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

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

    const result = await requestMagicLink(formData, safeNext(next));
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

    const params = new URLSearchParams();
    if (tab) params.set('tab', tab);
    if (next) params.set('next', next);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
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
        {!!error && tokenErrorMessage[error] && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <p className="text-center">{tokenErrorMessage[error]}</p>
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
              onClick={() => {
                const params = new URLSearchParams();
                if (tab) params.set('tab', tab);
                if (error) params.set('error', error.toString());
                if (next) params.set('next', next);

                router.push(`${pathname}?${params.toString()}`, { scroll: false });
              }}
            >
              Masuk dengan password
            </Button>
          </div>
        </Field>
      </form>
    </TabsContent>
  );
}