import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    value: "faq-1",
    question: "Apakah Kwitly bisa dipakai untuk usaha kecil dan freelancer?",
    answer:
      "Tentu. Kwitly sepenuhnya gratis untuk freelancer maupun UMKM dengan fitur lengkap untuk membuat invoice, mengirim tautan pembayaran, dan memantau status tagihan.",
  },
  {
    value: "faq-2",
    question: "Apakah data invoice saya aman?",
    answer:
      "Data Anda terenkripsi saat disimpan dan diakses. Setiap anggota tim hanya dapat melihat data sesuai izin yang Anda berikan, dan seluruh aktivitas penting tercatat di log audit.",
  },
  {
    value: "faq-3",
    question: "Bisakah saya mengirim invoice lewat WhatsApp atau email?",
    answer:
      "Bisa. Setiap invoice menghasilkan tautan pembayaran yang bisa langsung dikirim melalui WhatsApp, email, atau media sosial. Pengingat pembayaran juga dapat dijadwalkan otomatis.",
  },
  {
    value: "faq-4",
    question: "Apakah saya bisa mengunduh invoice dalam format PDF?",
    answer:
      "Tentu. Semua invoice yang Anda buat dapat langsung diunduh sebagai dokumen PDF rapi siap cetak atau dibagikan langsung melalui tautan online tanpa batas.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-canvas py-20">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Pertanyaan yang sering diajukan
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Belum menemukan jawabannya? Tim kami siap membantu Anda.
          </p>
        </div>

        <Accordion
          defaultValue={["faq-1"]}
          multiple
          className="mt-10 rounded-2xl border border-border bg-background px-8"
        >
          {FAQS.map((faq) => (
            <AccordionItem key={faq.value} value={faq.value}>
              <AccordionTrigger className="py-6 text-base font-semibold text-ink hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-sm leading-relaxed text-muted">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
