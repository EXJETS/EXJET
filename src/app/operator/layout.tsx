import { Sidebar } from "@/components/dashboard/sidebar";

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      <Sidebar role="operator" userName="Sky Charter Co." userInitials="SC" notifications={3} />
      <div className="flex-1 flex flex-col pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
