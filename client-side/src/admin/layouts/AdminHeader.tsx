// src/admin/layouts/AdminHeader.tsx

"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface AdminHeaderProps {
  pageTitle: string;
  pageSubtitle: string;
}

export default function AdminHeader({ pageTitle, pageSubtitle }: AdminHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  console.log("AdminHeader rendered", { pageTitle, pageSubtitle });

  return (
    <header className="flex justify-between items-center p-6 border-b w-full">
      {/* Tiêu đề trang */}
      <div className="min-w-[200px]">
        <h1 className="font-bold text-4xl">{pageTitle || "Default Title"}</h1>
        <p className="font-semibold text-base text-[#8A99AE]">{pageSubtitle || "Default Subtitle"}</p>
      </div>

      {/* Thông tin admin */}
      <div className="flex items-center gap-3 bg-[#02203B] rounded-full p-2 text-white">
        <Image
          src="/admin/admin_header/admin_header_user_avatar.svg"
          alt="Ảnh Hồ Sơ"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-medium">Nguyễn Phương</span>
          <span className="text-base text-[#CCCCCC]">dsun.agency@gmail.com</span>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded">
          <Image
            src="/admin/admin_header/admin_header_logout.svg"
            alt="Menu Người Dùng"
            width={20}
            height={20}
          />
        </button>
      </div>
    </header>
  );
}