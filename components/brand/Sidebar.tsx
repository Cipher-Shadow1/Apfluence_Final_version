"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBullhorn } from "react-icons/fa6";
import { motion } from "motion/react";
import {
  type LucideIcon,
  LayoutDashboard,
  Search,
  Mail,
  CreditCard,
  BarChart3,
  Headphones,
  Megaphone,
} from "lucide-react";

type NavItem =
  | { name: string; href: string; icon: React.ElementType }
  | {
      name: string;
      href: string;
      iconSrc: string;
      iconAlt: string;
    };

const NAV: NavItem[] = [
  { name: "Dashboard", href: "/brand", icon: LayoutDashboard },
  { name: "Campaigns", href: "/brand/campaigns", icon: FaBullhorn },
  { name: "Discovery", href: "/brand/discovery", icon: Search },
  { name: "Outreach", href: "/brand/outreach", icon: Mail },
  { name: "Payments", href: "/brand/payments", icon: CreditCard },
  { name: "Analytics", href: "/brand/analytics", icon: BarChart3 },

  { name: "Support", href: "/brand/support", icon: Headphones },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/brand") {
    return pathname === "/brand" || pathname === "/brand/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({
  icon: Icon,
  active,
}: {
  icon: React.ElementType;
  active: boolean;
}) {
  const isMegaphone = Icon === FaBullhorn;
  return (
    <Icon
      className={`${isMegaphone ? "w-6 h-6" : "w-6 h-6"} transition-colors ${active ? "text-white" : "text-white/60 group-hover:text-white"}`}
    />
  );
}

export const Sidebar = () => {
  const pathname = usePathname() ?? "";

  return (
    <aside className="fixed left-0 top-0 h-screen w-14 bg-[var(--color-brand-blue)] flex flex-col items-center justify-between py-4 z-[60]">
      <div className="flex flex-col items-center w-full">
        <Link
          href="/brand"
          className="mb-8 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5 transition-opacity hover:opacity-95"
          aria-label="Apfluence home"
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

        <nav className="flex flex-col gap-2 w-full items-center">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative p-2 transition-opacity group"
                title={item.name}
                aria-current={active ? "page" : undefined}
              >
                {"iconSrc" in item ? (
                  <Image
                    src={item.iconSrc}
                    alt={item.iconAlt}
                    width={24}
                    height={24}
                    className={`h-6 w-6 object-contain transition-opacity ${
                      active
                        ? "opacity-100"
                        : "opacity-60 group-hover:opacity-100"
                    }`}
                  />
                ) : (
                  <NavIcon icon={item.icon} active={active} />
                )}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-[3px] bg-white rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
