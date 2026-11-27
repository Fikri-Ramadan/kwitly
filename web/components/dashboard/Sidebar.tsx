'use client';

import { SIDE_LINKS } from "@/lib/definitions";
import Logo from "../Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import UserAvatar from "./UserAvatar";

interface SidebarProps {
  fullName: string;
  company?: string;
}

export default function Sidebar({fullName, company}: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className="flex-1 flex flex-col justify-between bg-ink w-full max-w-[240px] min-h-screen"
      style={{
        backgroundImage: `
          radial-gradient(480px 320px at 120% 0%, rgba(45, 212, 191, 0.28), transparent 40%)
        `
      }}
    >
      <div>
        <div className="py-6 px-8">
          <Logo type="dark" width={112} height={48} />
        </div>

        <div className="mt-2 px-5 flex flex-col gap-1 text-nav-muted font-semibold">
          {SIDE_LINKS.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={cn(
                'flex items-center gap-3 text-sm p-3 rounded-md border-l-3 border-transparent',
                pathname === link.href && 'text-white bg-primary-deep/30 border-primary-accent-on-dark'
              )}
            >
              {<link.Icon className="size-5" />}
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-white mx-4 mb-6 p-2.5 rounded-lg bg-muted/15">
          <UserAvatar name={fullName} />
          <div className="flex flex-col text-xs">
            <span className="text-white font-semibold">{fullName}</span>
            {!!company && <span className="text-nav-muted">{company}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}