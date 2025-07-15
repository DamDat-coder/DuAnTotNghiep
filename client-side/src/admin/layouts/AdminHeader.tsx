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

export default function AdminHeader({
  pageTitle,
  pageSubtitle,
}: AdminHeaderProps) {
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
          <div className="sk-chase">
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
          </div>
        </div>
      </header>
    );
  }

  if (!admin) return null;

  return (
    <header className="bg-[#F8FAFC] pt-8">
      <div className="flex justify-between items-start w-full max-w-full">
        <div>
          <h1 className="text-[32px] font-bold leading-tight ml-6">{pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1 ml-6">{pageSubtitle}</p>
        </div>

        <div className="w-[333px] h-[77px] flex items-center bg-black text-white rounded-[32px] px-4">
          <Image
            src={"/admin/admin_header/admin_header_user_avatar.svg"}
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />

          <div className="flex flex-col justify-center leading-tight ml-6">
            <span className="text-[16px] font-medium">
              {admin.email.split("@")[0]}
            </span>
            <span className="text-[14px] text-gray-300">{admin.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="ml-auto p-2 hover:bg-gray-800 rounded-full"
          >
            <Image
              src="/admin/admin_header/admin_header_logout.svg"
              alt="Đăng xuất"
              width={22}
              height={22}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
