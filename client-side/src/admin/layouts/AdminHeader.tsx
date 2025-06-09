"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchUser } from "@/services/userApi";
import { IUser } from "@/types/auth";

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
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    document.cookie = "refreshToken=; path=/; max-age=0";
    window.location.href = "/";
  };

  if (loading) {
    return (
      <header className="flex justify-between items-center px-8 border-b w-full h-[86px] bg-[#eaf3f8]">
        <div className="min-w-[200px]">
          <h1 className="font-bold text-4xl">{pageTitle || "Default Title"}</h1>
          <p className="font-semibold text-base text-[#8A99AE]">
            {pageSubtitle || "Default Subtitle"}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[#02203B] rounded-full px-5 py-2 text-white min-w-[280px] h-14 justify-center">
          <p>Đang tải...</p>
        </div>
      </header>
    );
  }

  if (!admin) return null;

  return (
    <header className="flex justify-between items-center px-8 border-b w-full h-[86px] bg-[#eaf3f8]">
      {/* Tiêu đề trang */}
      <div className="min-w-[200px] flex flex-col justify-center h-full">
        <h1 className="font-bold text-4xl leading-tight">{pageTitle || "Default Title"}</h1>
        <p className="font-semibold text-base text-[#8A99AE]">{pageSubtitle || "Default Subtitle"}</p>
      </div>
      {/* Thông tin admin */}
      <div className="flex items-center gap-4 bg-[#02203B] rounded-full px-6 py-3 text-white min-w-[200px] h-14">
        <Image
          src={admin.avatar || "/admin/admin_header/admin_header_user_avatar.svg"}
          alt="Ảnh Hồ Sơ" 
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div className="flex flex-col justify-center">
          <span className="font-medium text-lg leading-tight">{admin.email.split("@")[0]}</span>
          <span className="text-base text-[#CCCCCC] leading-tight">{admin.email}</span>
        </div>
        <button onClick={handleLogout} className="ml-2 p-2 hover:bg-[#283a51] rounded-full transition-all">
          <Image
            src="/admin/admin_header/admin_header_logout.svg"
            alt="Đăng Xuất"
            width={24}
            height={24}
          />
        </button>
      </div>
    </header>
  );
}
