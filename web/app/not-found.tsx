import Logo from "@/components/Logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { ArrowLeft, Plus, RefreshCcw, User } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen bg-canvas flex flex-col p-4 md:p-10"
      style={{
        backgroundImage: `
          radial-gradient(520px 420px at 85% 8%, rgba(45, 212, 191, 0.28), transparent 70%),
          radial-gradient(480px 380px at 0% 100%, rgba(56, 189, 248, 0.16), transparent 70%)
        `
      }}
    >
      <Logo width={112} height={48} />

      <div className="w-full max-w-[1000px] mx-auto flex-1 flex items-center gap-6">

        <div className="flex-3/5 flex flex-col items-center text-center gap-5 md:items-start md:text-start md:gap-6">
          <span className="rounded-full bg-danger-bg px-3.5 py-1 text-sm font-bold text-danger-fg">
            Error 404
          </span>

          <h1 className="max-w-xl text-xl font-extrabold tracking-tight text-ink sm:text-5xl md:leading-14">
            Halaman tidak ditemukan
          </h1>

          <p className="max-w-md text-sm text-muted sm:text-base">
            Maaf, halaman yang Anda cari tidak ada, telah dipindahkan, atau tautannya sudah tidak berlaku.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: 'default', size: 'xs' }), "py-6! text-xs font-bold rounded-md md:rounded-xl md:px-6 md:text-sm")}
            >
              <ArrowLeft className="size-4" /> Kembali ke Dashboard
            </Link>
            <Link
              href="/dashboard/invoices"
              className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), "py-6! text-xs font-bold rounded-md md:rounded-xl md:px-6 md:text-sm")}
            >
              Lihat daftar invoice
            </Link>
          </div>

          <div>
            <span className="font-bold text-sm text-muted">Mungkin Anda mencari</span>
            <div className="mt-2 flex justify-center gap-2 flex-wrap">
              <Link
                href="/dashboard/invoices/create"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), "py-5! px-4 font-bold rounded-full border md:py-6!")}
              >
                <Plus /> buat invoice
              </Link>
              <Link
                href="/dashboard/invoices/clients"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), "py-5! px-4 font-bold rounded-full border md:py-6!")}
              >
                <User /> Klien
              </Link>
              <Link
                href="/dashboard/invoices/recurring"
                className={cn(buttonVariants({ variant: 'outline', size: 'xs' }), "py-5! px-4 font-bold rounded-full border md:py-6!")}
              >
                <RefreshCcw /> Recurring
              </Link>
            </div>
          </div>

        </div>

        <div className="flex-2/5 hidden md:block">
          <img src={'/404-not-found.svg'} alt="404 svg" width={400} height={370} />
        </div>

      </div>

    </main >
  );
}