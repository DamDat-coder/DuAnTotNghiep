//adminlayout
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
      <div
        className="
          bg-[#F8FAFC] min-h-screen overflow-x-hidden
          ml-[240px] desktop:ml-[285px]
        "
      >
        <AdminHeader pageTitle={pageTitle} pageSubtitle={pageSubtitle} />
        <div
          className="
          w-full px-6 pb-8
          laptop:max-w-none
          desktop:max-w-[1440px] desktop:mx-auto
        "
        >
          {children}
        </div>
      </div>
    </>
  );
}
