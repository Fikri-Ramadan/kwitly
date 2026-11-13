import {
  BarChart3,
  Bell,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  points: string[];
}

const FEATURES: Feature[] = [
  {
    icon: FileText,
    title: "Invoice Terstruktur",
    description:
      "Buat invoice dari template siap pakai. Nomori, tanggal, dan rincian item otomatis tersusun rapi.",
    points: ["Template siap pakai", "Rincian item fleksibel", "Ekspor PDF & CSV"],
  },
  {
    icon: Bell,
    title: "Pengingat Otomatis",
    description:
      "Kwitly mengirim pengingat pembayaran ke pelanggan agar tagihan tidak menumpuk dan arus kas tetap sehat.",
    points: ["Pengingat terjadwal", "Pesan personalisasi", "Riwayat pengiriman"],
  },
  {
    icon: BarChart3,
    title: "Laporan Real-time",
    description:
      "PantauOmzet, pembayaran yang belum lunas, dan-aging invoice dari satu dasbor yang mudah dibaca.",
    points: ["Ringkasan omzet", "Status pembayaran", "Filter periode"],
  },
  {
    icon: Users,
    title: "Multi-klien",
    description:
      "Simpan data pelanggan sekali saja. Invoice berikutnya dapat dibuat dalam hitungan detik.",
    points: ["Kontak tersimpan", "Riwayat transaksi", "Tag & kategori"],
  },
  {
    icon: ShieldCheck,
    title: "Akses Aman",
    description:
      "Data bisnis Anda terenkripsi dan hanya dapat diakses oleh anggota tim yang Anda izinkan.",
    points: ["Kontrol akses tim", "Enkripsi data", "Log aktivitas"],
  },
  {
    icon: Sparkles,
    title: "Alur Kerja Cerdas",
    description:
      "Hubungkan invoice dengan pembayaran dan catatan agar setiap transaksi mudah ditelusuri.",
    points: ["Status real-time", "Catatan internal", "Integrasi pembayaran"],
  },
];

export default function Features() {
  return (
    <section id="fitur" className="scroll-mt-20 bg-canvas py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Fitur
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Semua yang Anda butuhkan untuk kelola invoice
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Dari membuat invoice hingga menagih pembayaran, Kwitly menyederhanakan
            pekerjaan administratif harian Anda.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="gap-3 border-border py-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <CardHeader className="px-5">
                <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" aria-hidden />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-[13px]">{feature.description}</CardDescription>
              </CardHeader>

              <CardContent className="px-5">
                <ul className="flex flex-col gap-2">
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-center gap-2 text-[13px] text-muted"
                    >
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full bg-primary-light"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
