import { ChartColumn, Check, LucideIcon, RotateCw, SquareText } from "lucide-react";
import Logo from "./Logo";

const HEADLINE = ["Tagih lebih cepat,", "terima lebih tenang."] as const;
const DESCRIPTION = "Buat, kirim, dan pantau invoice dari satu tempat tanpa spreadsheet.";

const FEATURES = [
  { label: "Invoice rapi", icon: SquareText, path: "M4 4h16v16H4zM8 9h8M8 13h5" },
  { label: "Recurring otomatis", icon: RotateCw, path: "M21 12a9 9 0 11-3-6.7M21 4v5h-5" },
  { label: "Pantau status", icon: ChartColumn, path: "M4 20V10M10 20V4M16 20v-8M22 20H2" },
] as const;

const PREVIEW_INVOICE = {
  number: "INV-2026-0043",
  client: "PT Maju Jaya",
  status: "Menunggu",
  lines: [
    { label: "Company Profile × 1", amount: "Rp 2.500.000" },
    { label: "Hosting Tahunan × 2", amount: "Rp 1.600.000" },
  ],
  total: "Rp 4.551.000",
} as const;

const PREVIEW_PAYMENT = {
  title: "Pembayaran diterima",
  detail: "INV-2026-0045 · Rp 9.900.000",
} as const;

export default function BrandPannel() {
  return (
    <div
      className="flex-1 hidden flex-col max-w-[610px] bg-navy p-12 gap-8 lg:flex"
      style={{
        backgroundImage: `
          radial-gradient(520px 420px at 85% 8%, rgba(45, 212, 191, 0.28), transparent 70%),
          radial-gradient(480px 380px at 0% 100%, rgba(56, 189, 248, 0.16), transparent 70%)
        `
      }}
    >
      <Logo type="DARK" />
      <div className="space-y-2">
        <p className="text-[38px] font-bold leading-11 tracking-tight">
          {HEADLINE[0]}
          <br />
          <span className="text-primary-accent-on-dark">{HEADLINE[1]}</span>
        </p>
        <p className="w-4/5 text-nav-muted">{DESCRIPTION}</p>
      </div>
      <div aria-hidden='true' className="w-[400px] -space-y-3">
        <InvoiceCard />
        <InvoiceNotifCard />
      </div>
      <div className="mt-auto flex gap-2">
        <Badge icon={FEATURES[0].icon} text={FEATURES[0].label} />
        <Badge icon={FEATURES[1].icon} text={FEATURES[1].label} />
        <Badge icon={FEATURES[2].icon} text={FEATURES[2].label} />
      </div>
    </div>
  );
}

function Badge({ text, icon: Icon }: {
  text: string;
  icon: LucideIcon | React.ComponentType<{ className?: string; }>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-white/80 text-[13px] bg-white/8 py-1.75 px-3.5 rounded-full border border-white/14">
      <Icon className="w-4 h-4 text-primary-accent-on-dark" />
      {text}
    </div>
  );
}

function InvoiceCard() {
  return (
    <div className="w-[400px] h-[210px] p-5 bg-white rounded-card text-ink">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted">Invoice</div>
          <div className="text[15px] font-bold">{PREVIEW_INVOICE.number}</div>
        </div>
        <span className="flex justify-center items-center rounded-full py-1 px-2.5 text-xs font-semibold text-warning-fg bg-warning-bg">
          {PREVIEW_INVOICE.status}
        </span>
      </div>

      <div className="mt-2 mb-1.5 text-muted text-[13px]">{PREVIEW_INVOICE.client}</div>

      {
        PREVIEW_INVOICE.lines.map((line, index) => (
          <div key={index} className="text-[13px] border-t border-line py-2 flex justify-between">
            <span>{line.label}</span>
            <span className="tabular-nums">{line.amount}</span>
          </div>
        ))
      }

      <div className="pt-2 text-base font-bold border-t border-line flex justify-between">
        <span>Total</span>
        <span className="tabular-nums">{PREVIEW_INVOICE.total}</span>
      </div>
    </div>
  );
}

function InvoiceNotifCard() {
  return (
    <div className="flex items-center justify-start gap-4 px-4 ml-7.5 w-[370px] h-[60px] bg-ink/90 rounded-card border border-white/14">
      <div className="bg-[#DCFCE7] w-fit rounded-full p-2">
        <Check className="text-success-fg w-4 h-4" />
      </div>
      <div className="leading-4">
        <p className=" font-semibold text-[14px]">{PREVIEW_PAYMENT.title}</p>
        <p className="text-nav-muted text-[13px]">{PREVIEW_PAYMENT.detail}</p>
      </div>
    </div>
  );
}