"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  Home,
  Users,
  Wallet,
  HeartPulse,
  UserRound,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/community", label: "Community", icon: Users },
  { href: "/earnings", label: "Earnings", icon: Wallet },
  { href: "/health", label: "Health", icon: HeartPulse },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <div className="py-6">{children}</div>
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={isActive ? "active" : undefined}>
              <Icon size={20} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
