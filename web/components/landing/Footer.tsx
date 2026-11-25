import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import Logo from "@/components/Logo";

const FOOTER_LINKS = [
  {
    title: "Produk",
    links: [
      { label: "Fitur", href: "#fitur" },
      { label: "Harga", href: "#harga" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Karier", href: "#" },
      { label: "Kontak", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Kebijakan Privasi", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="flex flex-col items-center gap-3 lg:items-start">
            <Logo />
            <p className="max-w-xs text-sm leading-relaxed text-muted text-center lg:text-start">
              Aplikasi pengelolaan invoice untuk membantu bisnis Anda tumbuh
              tanpa administrasi yang berantakan.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="flex flex-col items-center gap-3 lg:items-start">
              <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
              <ul className="flex flex-col items-center gap-2 lg:items-start">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Kwitly. Seluruh hak cipta dilindungi.</p>
          <p>Dibangun untuk UMKM Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
