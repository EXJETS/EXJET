import { Sidebar } from "@/components/dashboard/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="admin" userName="Admin User" userInitials="AU" notifications={12} />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
