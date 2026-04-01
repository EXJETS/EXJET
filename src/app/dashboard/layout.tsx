import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="client" userName="John Doe" userInitials="JD" notifications={2} />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
