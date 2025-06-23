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
    <>
      <Sidebar />
      <div className="ml-[285px] bg-[#F8FAFC] min-h-screen">
        <AdminHeader pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <div className="max-w-[1185px] w-full mx-auto">{children}</div>
      </div>
    </>
  );
}
