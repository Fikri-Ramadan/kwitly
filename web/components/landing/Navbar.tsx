'use client';

import { MotionConfig, motion, type Variants } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import Link from "next/link";
import NavbarMobile from "./NavbarMobile";
import ScrollProgress from "./ScrollProgress";

export const NAV_LINKS = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "FAQ", href: "/#faq" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Navbar turun dari atas, lalu isinya muncul berurutan
const headerVariants: Variants = {
  hidden: { y: -24, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: EASE,
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: -8, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export default function Navbar({ isAuth }: { isAuth: boolean; }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md"
      >
        <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <motion.div variants={itemVariants}>
            <Link href="/" className="flex items-center gap-2">
              <Logo width={112} height={29} />
            </Link>
          </motion.div>

          {/* Nav desktop */}
          <motion.ul
            variants={itemVariants}
            className="hidden items-center gap-8 md:flex"
          >
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
          </motion.ul>

          <motion.div
            variants={itemVariants}
            className="hidden items-center gap-2 md:flex"
          >
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
          </motion.div>

          {/* Nav mobile */}
          <NavbarMobile isAuth={isAuth} />
        </nav>

        {/* Progress scroll tepat di bawah navbar */}
        <ScrollProgress />
      </motion.header>
    </MotionConfig>
  );
}