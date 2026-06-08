import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f5f0eb] text-[#0a1628]">
      <Sidebar role="client" userName="John Doe" userInitials="JD" notifications={2} />
      <div className="flex flex-1 flex-col pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
