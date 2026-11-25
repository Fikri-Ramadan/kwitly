'use client';

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Button, buttonVariants } from "../ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";
import { NAV_LINKS } from "@/lib/definitions";

export default function NavbarMobile({ isAuth = false }: { isAuth: boolean; }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon" aria-label="Buka menu navigasi">
              <Menu />
            </Button>
          }
        />
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className={'border-b border-nav-muted pb-2'}>Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-2 border-t border-border p-4">
            {
              isAuth ?
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
                      "h-9 w-full"
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/sign-up"
                    className={cn(buttonVariants({ size: "lg" }), "h-9 w-full")}
                    onClick={() => setMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </>
            }
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}