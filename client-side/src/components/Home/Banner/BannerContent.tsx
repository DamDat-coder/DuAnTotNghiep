"use client";

import Link from "next/link";
import { MouseEventHandler } from "react";

interface BannerContentProps {
  id: string;
  status: string;
  name: string;
  description: string;
  dark?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function BannerContent({
  id = "",
  status = "N/A",
  name = "Sản phẩm không xác định",
  description = "Không có mô tả",
  dark,
  onClick,
}: BannerContentProps) {
  return (
    <div
      className={`flex flex-col items-center tablet:items-center justify-evenly gap-3 mt-5 text-${
        dark ? "white" : "gray-700"
      } z-10`} // Thêm z-index để đảm bảo hiển thị trên gradient
    >
      <div className="banner_status text-base font-medium">
        {status || "N/A"}
      </div>
      <div className="banner_name text-[1.5rem] font-bold tablet:text-2xl leading-[1.8125rem] line-clamp-1">
        {name || "Sản phẩm không xác định"}
      </div>
      <div className="banner_description text-base tablet:text-lg text-center max-w-[90%]">
        {description || "Không có mô tả"}
      </div>
      <Link
        href={`/products/${id}`}
        aria-label={`Mua ${name || "sản phẩm"}`}
        className={`banner_action text-[1rem] px-6 py-2 font-bold rounded-full hover:opacity-70 transition-colors ${
          dark ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        Shop
      </Link>
    </div>
  );
}
