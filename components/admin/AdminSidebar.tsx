"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  ReceiptText,
  HandCoins,
  BanknoteArrowUp,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Item = {
  name: string;
  href: string;
  icon: LucideIcon;
};

const NAV: Item[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Deposits", href: "/admin/deposits", icon: ReceiptText },
  { name: "Campaigns", href: "/admin/campaigns", icon: HandCoins },
  { name: "Withdrawals", href: "/admin/withdrawals", icon: BanknoteArrowUp },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const supabase = createClient();

  return (
    <aside className="fixed left-0 top-0 z-[60] flex h-screen w-14 flex-col items-center justify-between bg-[#0F172A] py-4">
      <div className="flex w-full flex-col items-center">
        <Link
          href="/admin"
          className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-opacity hover:opacity-95"
          aria-label="Admin home"
        >
          <Image
            src="/logo%20blue%20gradient.svg"
            alt="Apfluence"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
        </Link>

        <nav className="flex w-full flex-col items-center gap-2">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative p-2"
                title={item.name}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`h-6 w-6 transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}
                />
                {active && (
                  <motion.div
                    layoutId="admin-sidebar-active"
                    className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        title="Log out"
        className="group relative p-2"
        onClick={() => {
          void supabase.auth.signOut().finally(() => {
            router.push("/sign-in/admin");
          });
        }}
      >
        <LogOut className="h-6 w-6 text-white/60 transition-colors group-hover:text-white" />
      </button>
    </aside>
  );
}
