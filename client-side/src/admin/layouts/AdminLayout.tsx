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
    <div className="flex h-screen bg-[#F8FAFC]">
      <div className="shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col pl-6 pr-0">
        <AdminHeader pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1185px] w-full mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}
