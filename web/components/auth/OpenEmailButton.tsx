'use client';

import { cn } from "cn";
import { Button, buttonVariants } from "../ui/button";

const INBOX_URLS: Record<string, string> = {
  "gmail.com": "https://mail.google.com/mail/u/0/#inbox",
  "googlemail.com": "https://mail.google.com/mail/u/0/#inbox",
  "outlook.com": "https://outlook.live.com/mail/0/inbox",
  "hotmail.com": "https://outlook.live.com/mail/0/inbox",
  "live.com": "https://outlook.live.com/mail/0/inbox",
  "yahoo.com": "https://mail.yahoo.com/d/folders/1",
  "icloud.com": "https://www.icloud.com/mail",
  "proton.me": "https://mail.proton.me/u/0/inbox",
  "protonmail.com": "https://mail.proton.me/u/0/inbox",
};

function getInboxUrl(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? '';
  return (domain && INBOX_URLS[domain]) || "mailto:";
}

export function OpenEmailButton({ email }: { email: string | undefined; }) {
  const href = getInboxUrl(email ?? '');
  const isWeb = href.startsWith("http");

  return (
    <a
      href={href}
      {...(isWeb && { target: "_blank", rel: "noopener noreferrer" })}
      className={cn(buttonVariants({ variant: "default" }), "w-full py-6! font-bold")}
    >
      Buka aplikasi email
    </a>
  );
}