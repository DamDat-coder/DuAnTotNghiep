"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUser} from "@/services/userApi";
import { IUser } from "@/types";
interface AdminHeaderProps {
  pageTitle: string;
  pageSubtitle: string;
}

export default function AdminHeader({ pageTitle, pageSubtitle }: AdminHeaderProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const userData = await fetchUser();
        if (userData && userData.role === "admin") {
          setAdmin(userData);
        } else {

          router.push("/");
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin admin:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [router]);

  const handleLogout = () => {
    // Xóa token và trạng thái
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "refreshToken=; path=/; max-age=0";
    router.push("/");
  };

  if (loading) {
    return (
      <header className="flex justify-between items-center p-6 border-b w-full">
        <div className="min-w-[200px]">
          <h1 className="font-bold text-4xl">{pageTitle || "Default Title"}</h1>
          <p className="font-semibold text-base text-[#8A99AE]">
            {pageSubtitle || "Default Subtitle"}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#02203B] rounded-full p-2 text-white">
          <p>Đang tải...</p>
        </div>
      </header>
    );
  }

  if (!admin) {
    return null; // Hoặc redirect, đã xử lý trong useEffect
  }

  return (
    <header className="flex justify-between items-center p-6 border-b w-full">
      {/* Tiêu đề trang */}
      <div className="min-w-[200px]">
        <h1 className="font-bold text-4xl">{pageTitle || "Default Title"}</h1>
        <p className="font-semibold text-base text-[#8A99AE]">
          {pageSubtitle || "Default Subtitle"}
        </p>
      </div>

      {/* Thông tin admin */}
      <div className="flex items-center gap-3 bg-[#02203B] rounded-full p-2 text-white">
        <Image
          src={admin.avatar || "/admin/admin_header/admin_header_user_avatar.svg"}
          alt="Ảnh Hồ Sơ"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-medium">{admin.email.split("@")[0]}</span>
          <span className="text-base text-[#CCCCCC]">{admin.email}</span>
        </div>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded">
          <Image
            src="/admin/admin_header/admin_header_logout.svg"
            alt="Đăng Xuất"
            width={20}
            height={20}
          />
        </button>
      </div>
    </header>
  );
}