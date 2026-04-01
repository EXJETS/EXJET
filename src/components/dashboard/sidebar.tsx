"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Plane, LayoutDashboard, Calendar, DollarSign, Settings, Users,
  BarChart3, Map, Building2, ShieldCheck, Menu, X, Bell, ChevronDown,
  Wrench, Radio, FileText, CreditCard, LogOut, User,
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

const roleConfig: Record<DashboardRole, { label: string; color: string; dot: string }> = {
  client:   { label: "Client Portal",   color: "from-amber-500 to-amber-600",   dot: "bg-amber-400"  },
  operator: { label: "Operator Portal", color: "from-blue-600 to-blue-700",     dot: "bg-blue-400"   },
  admin:    { label: "Admin Portal",    color: "from-gray-800 to-gray-900",     dot: "bg-green-400"  },
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
  const cfg = roleConfig[role];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo / Role */}
      <div className={cn("px-5 py-4 bg-gradient-to-r text-white", cfg.color)}>
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">EXJET</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", cfg.dot)} />
          <span className="text-xs font-medium text-white/80">{cfg.label}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" + role.split("/")[0] && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-4.5 h-4.5", active ? "text-amber-600" : "text-gray-400")} style={{ width: "1.125rem", height: "1.125rem" }} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        {notifications > 0 && (
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 mb-1">
            <Bell className="w-4 h-4 text-gray-400" />
            <span className="flex-1">Notifications</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">{notifications}</span>
          </button>
        )}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
            <p className="text-[11px] text-gray-400 capitalize">{role}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-200 min-h-screen sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br text-white", cfg.color)}>
            <Plane className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-900">EXJET</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 bg-white shadow-xl flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
