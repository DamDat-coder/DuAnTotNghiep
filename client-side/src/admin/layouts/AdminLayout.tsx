// src/admin/layouts/AdminLayout.tsx
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import AdminNavigation from "../components/AdminNavigation";

interface NavigationItem {
  label: string;
  href: string;
  filter?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
  pageSubtitle: string;
  addButton?: { label: string; href: string }; 
  navigationItems?: NavigationItem[];
  onFilter?: (filter: string) => void; // Thêm prop onFilter
}

export default function AdminLayout({
  children,
  pageTitle,
  pageSubtitle,
  addButton,
  navigationItems = [],
  onFilter,
}: AdminLayoutProps) {
  return (
    <div className="flex h-screen bg-[#eaf3f8]">
      {/* Sidebar cố định bên trái */}
      <Sidebar />
      {/* Nội dung chính bên phải */}
      <div className="flex-1 flex flex-col">
        <AdminHeader pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        {navigationItems.length > 0 && (
          <AdminNavigation items={navigationItems} onFilter={onFilter}  addButton={addButton}/>
        )}
        <main className="flex-1 overflow-y-auto w-[95%] mx-auto">{children}</main>
      </div>
    </div>
  );
}