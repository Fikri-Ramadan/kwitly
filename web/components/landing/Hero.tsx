"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INVOICE_STATS = [
  { label: "Total Ditagih", value: "Rp 38,4 jt" },
  { label: "Lunas", value: "24 invoice" },
  { label: "Menunggu", value: "5 invoice" },
];

const INVOICE_ROWS = [
  { id: "INV-0241", client: "Studio Arunika", amount: "Rp 4.250.000", status: "Lunas" },
  { id: "INV-0240", client: "Kopi Senja", amount: "Rp 1.180.000", status: "Menunggu" },
  { id: "INV-0239", client: "Ruang Kreasi", amount: "Rp 7.900.000", status: "Lunas" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const textContainer: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.25, staggerChildren: 0.1 } },
};

const textItem: Variants = {
  hidden: { y: 24, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: EASE } },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const k = reduce ? 0 : 1;
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 180 * k]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60 * k]);
  const backFarY = useTransform(scrollYProgress, [0, 1], [0, 48 * k]);
  const backNearY = useTransform(scrollYProgress, [0, 1], [0, 24 * k]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, -36 * k]);
  const chipY = useTransform(scrollYProgress, [0, 1], [0, -28 * k]);

  return (
    <MotionConfig reducedMotion="user">
      <section ref={sectionRef} className="relative overflow-hidden bg-background">
        <motion.div
          aria-hidden
          style={{ y: glowY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-primary-tint/50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 py-10 sm:px-6 lg:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
          <motion.div
            variants={textContainer}
            initial="hidden"
            animate="show"
            style={{ y: textY }}
            className="flex flex-col items-center gap-6 lg:items-start"
          >
            <motion.div variants={textItem}>
              <Badge
                variant="secondary"
                className="border border-primary/20 bg-primary/10 text-primary"
              >
                <Sparkles />
                Invoice management generasi baru
              </Badge>
            </motion.div>

            <div className="flex flex-col gap-4">
              <motion.h1
                variants={textItem}
                className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.08]"
              >
                Kelola invoice dalam satu tempat,{" "}
                <span className="text-primary">lebih rapi dan cepat</span>
              </motion.h1>
              <motion.p
                variants={textItem}
                className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg"
              >
                Kwitly membantu Anda membuat, mengirim, dan memantau invoice
                pelanggan. Tidak ada lagi spreadsheet yang berantakan atau tagihan
                yang terlambat terlacak.
              </motion.p>
            </div>

            <motion.div variants={textItem} className="flex flex-row gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-base")}
              >
                Mulai Gratis
                <ArrowRight data-icon="inline-end" />
              </Link>
              <Link
                href="#fitur"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 px-6 text-base"
                )}
              >
                Lihat Fitur
              </Link>
            </motion.div>

            <motion.ul
              variants={textItem}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Setup cepat
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Ekspor PDF instan
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Kirim invoice ke email klien
              </li>
            </motion.ul>
          </motion.div>

          {/* Mockup Invoice Card: masuk terakhir, lalu tiap lapisan parallax sendiri-sendiri */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            className="relative w-full max-w-[420px] mx-auto"
          >
            <motion.div
              aria-hidden="true"
              style={{ y: backFarY }}
              className="absolute inset-x-4  -bottom-4 w-full h-full bg-white/80 border border-gray-200 rounded-2xl shadow-xl z-1"
            />

            <motion.div
              aria-hidden="true"
              style={{ y: backNearY }}
              className="absolute inset-x-2 -bottom-2 w-full h-full bg-white/80 border border-gray-200 rounded-2xl shadow-md z-2"
            />

            <motion.div
              style={{ y: frontY }}
              className="relative bg-white border border-gray-200 rounded-2xl shadow-md z-10"
            >
              <div className="flex justify-between items-center px-4 pt-4">
                <h3 className="font-bold text-gray-900">Ringkasan Invoice</h3>
                <Badge className="bg-success-bg text-success-fg font-semibold">Aktif</Badge>
              </div>

              <div className="border border-border my-3" />

              <div className="flex flex-col gap-4 px-4 pb-4">
                <div className="grid grid-cols-3 gap-3">
                  {INVOICE_STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <p className="text-[10px] font-medium text-muted-foreground lg:text-[11px]">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-[12px] font-bold text-ink lg:text-sm">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col overflow-hidden rounded-xl border border-border">
                  {INVOICE_ROWS.map((row, index) => (
                    <div
                      key={row.id}
                      className={
                        index === INVOICE_ROWS.length - 1
                          ? "flex items-center justify-between gap-3 px-3 py-3"
                          : "flex items-center justify-between gap-3 border-b border-border px-3 py-3"
                      }
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-ink lg:text-xs">
                          {row.id}
                        </span>
                        <span className="text-[11px] text-muted-foreground lg:text-xs">
                          {row.client}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-semibold text-ink lg:text-xs">
                          {row.amount}
                        </span>
                        <Badge
                          variant="secondary"
                          className={
                            row.status === "Lunas"
                              ? "bg-success-bg text-success-fg"
                              : "bg-warning-bg text-warning-fg"
                          }
                        >
                          {row.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifikasi: pop-in belakangan, paling dekat ke penonton saat scroll */}
              <motion.div
                style={{ y: chipY }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 1.2, ease: EASE }}
                className="absolute -bottom-5 -right-4 z-10 flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-lg"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                  Pembayaran baru diterima · <span className="font-bold">Rp 4.250.000</span>
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </MotionConfig>
  );
}