import { ChartColumnBig, FilePen, Send } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { Button } from "../ui/button";

interface Step {
  name: string;
  icon: React.ComponentType<{ className?: string; }>;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    name: "Create",
    icon: FilePen,
    title: 'Buat Invoice Instan',
    description: "Pilih produk/jasa Anda, masukkan detail klien, dan biarkan sistem menghitung total otomatis.",
  },
  {
    name: "Send",
    icon: Send,
    title: 'Kirim & Jadwalkan',
    description: "Unduh sebagai PDF atau kirim langsung ke klien lengkap dengan pengingat jatuh tempo otomatis.",
  },
  {
    name: "Analyst",
    icon: ChartColumnBig,
    title: 'Pantau Status Real-Time',
    description: "Ketahui invoice mana yang sudah dibayar atau tertunda dalam satu dashboard yang rapi.",
  },
];

export default function HowItWork() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 bg-background py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Cara Kerja
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Buat dan kelola invoice dalam 3 langkah mudah
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Tidak perlu keahlihan akuntansi. Atur tagihan bisnis Anda dalam hitungan menit
            tanpa biaya apa pun.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Card
              key={step.name}
              className={"p-4 border-primary/40 shadow-lg ring-1 ring-primary/30"}
            >
              <CardHeader className="px-0">
                <Badge className="w-6 h-6 p-4 text-lg">{index + 1}</Badge>
                <div className="w-fit mx-auto -mt-4 p-4 bg-muted/10 rounded-full flex items-center justify-center">
                  <step.icon className="size-16" />
                </div>
              </CardHeader>

              <CardContent className="px-0 pb-2 flex-1 text-center space-y-2">
                <div className="text-xl font-semibold">{step.title}</div>
                <div className="text-sm text-muted">{step.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-2xl text-center space-y-2">
          <Button className={'px-4 py-5'}>
            Mulai Gratis Sekarang
          </Button>
          <p className="text-center text-sm text-muted">
            100% Gratis. Tanpa kartu kredit.
          </p>
        </div>
      </div>
    </section>
  );
}