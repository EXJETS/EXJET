"use client";

import { useState } from "react";
import { Search, Users, UserCheck, Ban, Mail } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";

const users = [
  { id: "u-001", name: "Alexander M.", email: "alex.m@email.com",   joined: "Jan 2024", bookings: 12, spent: 142800, status: "active"   as const, lastSeen: "Today"      },
  { id: "u-002", name: "Sophia L.",    email: "sophia@venture.co",  joined: "Mar 2024", bookings: 8,  spent: 98400,  status: "active"   as const, lastSeen: "Yesterday"  },
  { id: "u-003", name: "James R.",     email: "james.r@corp.com",   joined: "Jun 2024", bookings: 5,  spent: 67200,  status: "active"   as const, lastSeen: "3 days ago" },
  { id: "u-004", name: "Victoria K.", email: "v.kensington@pm.me", joined: "Aug 2024", bookings: 18, spent: 231000, status: "active"   as const, lastSeen: "Today"      },
  { id: "u-005", name: "Michael B.",  email: "mb@globalventures.io",joined: "Sep 2024", bookings: 3,  spent: 38400,  status: "active"   as const, lastSeen: "1 week ago" },
  { id: "u-006", name: "Emma W.",     email: "emma.w@studio.co",   joined: "Oct 2024", bookings: 7,  spent: 84600,  status: "active"   as const, lastSeen: "2 days ago" },
  { id: "u-007", name: "Robert D.",   email: "rdavis@hedge.fund",  joined: "Nov 2024", bookings: 2,  spent: 18200,  status: "inactive" as const, lastSeen: "2 weeks ago"},
  { id: "u-008", name: "Linda S.",    email: "linda@creatives.io", joined: "Dec 2024", bookings: 4,  spent: 52800,  status: "active"   as const, lastSeen: "4 days ago" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|"active"|"inactive">("all");

  const filtered = users.filter((u) => {
    if (filter !== "all" && u.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users"   value={String(users.length)}                                            icon={Users}     color="amber" />
        <StatCard label="Active"        value={String(users.filter(u=>u.status==="active").length)}              icon={UserCheck} color="green" />
        <StatCard label="Total Flights" value={String(users.reduce((a,u)=>a+u.bookings,0))}                     icon={Users}     color="blue"  />
        <StatCard label="Total Spend"   value={formatCurrency(users.reduce((a,u)=>a+u.spent,0))}                icon={DollarSign}color="purple"/>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none" />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["all","active","inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize",
                filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["User","Email","Joined","Bookings","Total Spent","Last Seen","Status",""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 text-xs font-bold">
                      {u.name.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.joined}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{u.bookings}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(u.spent)}</td>
                <td className="px-4 py-3 text-xs text-gray-400">{u.lastSeen}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold",
                    u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Email"><Mail className="w-3.5 h-3.5" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Suspend"><Ban className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
