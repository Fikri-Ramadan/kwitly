import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { hasSession } from "@/lib/auth/session";
import Link from "next/link";
import NavbarMobile from "./NavbarMobile";
import { NAV_LINKS } from "@/lib/definitions";

export default async function Navbar() {
  const isAuth = await hasSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo width={112} height={29} />
        </Link>

        {/* Nav desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {isAuth ?
            <Link href="/dashboard"
              className={cn(buttonVariants({ size: "lg" }), "h-9 px-4")}>
              Masuk Dashboard
            </Link>
            :
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-9 px-3 border border-nav-muted"
                )}
              >
                Masuk
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "h-9 px-4")}
              >
                Daftar
              </Link>
            </>
          }
        </div>

        {/* Nav mobile */}
        <NavbarMobile isAuth={isAuth} />

      </nav>
    </header>
  );
}
