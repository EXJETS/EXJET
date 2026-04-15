"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Plane, LayoutDashboard, Calendar, DollarSign, Settings, Users,
  BarChart3, Building2, Menu, X, Bell, Radio, CreditCard, LogOut, User,
} from "lucide-react";
import { useState } from "react";

export type DashboardRole = "client" | "operator" | "admin";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: Record<DashboardRole, NavItem[]> = {
  client: [
    { href: "/dashboard",              label: "Overview",         icon: LayoutDashboard },
    { href: "/dashboard/trips",        label: "My Trips",         icon: Calendar        },
    { href: "/dashboard/tracking",     label: "Track My Jet",     icon: Radio           },
    { href: "/dashboard/payments",     label: "Payments",         icon: CreditCard      },
    { href: "/dashboard/profile",      label: "Profile",          icon: User            },
  ],
  operator: [
    { href: "/operator",               label: "Overview",         icon: LayoutDashboard },
    { href: "/operator/fleet",         label: "My Fleet",         icon: Plane           },
    { href: "/operator/bookings",      label: "Bookings",         icon: Calendar,  badge: "3" },
    { href: "/operator/earnings",      label: "Earnings",         icon: DollarSign      },
    { href: "/operator/settings",      label: "Settings",         icon: Settings        },
  ],
  admin: [
    { href: "/admin",                  label: "Overview",         icon: LayoutDashboard },
    { href: "/admin/bookings",         label: "All Bookings",     icon: Calendar,  badge: "12" },
    { href: "/admin/operators",        label: "Operators",        icon: Building2       },
    { href: "/admin/users",            label: "Users",            icon: Users           },
    { href: "/admin/analytics",        label: "Analytics",        icon: BarChart3       },
    { href: "/admin/settings",         label: "Settings",         icon: Settings        },
  ],
};

const roleLabels: Record<DashboardRole, string> = {
  client:   "Client Portal",
  operator: "Operator Portal",
  admin:    "Admin Portal",
};

interface SidebarProps {
  role: DashboardRole;
  userName?: string;
  userInitials?: string;
  notifications?: number;
}

export function Sidebar({ role, userName = "John Doe", userInitials = "JD", notifications = 0 }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = navItems[role];
  const roleLabel = roleLabels[role];

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-black">
      {/* Logo / Role */}
      <div className="border-b border-white/[0.08] px-5 py-5">
        <Link href="/" className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04]">
            <Plane className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">EXJET</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">{roleLabel}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" + role.split("/")[0] && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                active
                  ? "border border-white/[0.08] bg-white/[0.06] text-white"
                  : "border border-transparent text-white/60 hover:bg-white/[0.04] hover:text-white"
              )}
            >
              <item.icon
                className={cn("h-4 w-4", active ? "text-white" : "text-white/40")}
                strokeWidth={1.75}
              />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="rounded-full border border-white/15 bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-white/[0.08] px-3 py-4">
        {notifications > 0 && (
          <button className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white">
            <Bell className="h-4 w-4 text-white/40" strokeWidth={1.75} />
            <span className="flex-1 text-left">Notifications</span>
            <span className="rounded-full bg-red-500/15 px-1.5 py-0.5 font-mono text-[10px] text-red-300 ring-1 ring-red-400/20">
              {notifications}
            </span>
          </button>
        )}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[11px] font-semibold text-white">
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{userName}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{role}</p>
          </div>
          <button className="text-white/40 transition-colors hover:text-white">
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen min-h-screen w-56 shrink-0 flex-col border-r border-white/[0.08] bg-black lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-black px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/15 bg-white/[0.04]">
            <Plane className="h-3.5 w-3.5 text-white" strokeWidth={2} />
          </div>
          <span className="text-[14px] font-semibold tracking-tight text-white">EXJET</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-64 flex-col border-r border-white/[0.08] bg-black">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
