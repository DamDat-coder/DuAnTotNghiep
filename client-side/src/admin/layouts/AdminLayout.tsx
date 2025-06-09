// src/admin/layouts/AdminLayout.tsx
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({
  children,
  pageTitle,
  pageSubtitle,
}: {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle: string;
}) {
  return (
    <div className="flex h-screen bg-[#eaf3f8]">
      {/* Sidebar */}
      <Sidebar />
      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <div className="flex-1 flex justify-center overflow-y-auto">
          <div className="max-w-[1185px] w-full px-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
