// src/admin/layouts/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="h-full w-[21.5625rem] bg-black text-white flex flex-col sticky top-0 rounded-r-3xl">
      <div className="p-4 flex flex-col gap-12 w-full h-auto">
        <Link href="/admin/dashboard">
          <Image src="/admin/sidebar/logo.svg" alt="Logo Công Ty" width={120} height={40} />
        </Link>
        <h1 className="text-[1.5rem] font-bold">MENU</h1>
      </div>
      <ul className="flex-1 flex flex-col gap-4 p-4">
        <li>
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-3 p-2 rounded ${
              isActive("/admin/dashboard") ? "bg-white text-black" : "hover:bg-gray-800"
            }`}
          >
            <Image
              src={isActive("/admin/dashboard") ? "/admin/sidebar/dashboard_active.svg" : "/admin/sidebar/dashboard.svg"}
              alt="Dashboard"
              width={20}
              height={20}
            />
            <span className="text-lg">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/order"
            className={`flex items-center gap-3 p-2 rounded ${
              isActive("/admin/order") ? "bg-white text-black" : "hover:bg-gray-800"
            }`}
          >
            <Image
              src={isActive("/admin/order") ? "/admin/sidebar/order_active.svg" : "/admin/sidebar/order.svg"}
              alt="Đơn hàng"
              width={20}
              height={20}
            />
            <span className="text-lg">Đơn hàng</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/products"
            className={`flex items-center gap-3 p-2 rounded ${
              isActive("/admin/products") ? "bg-white text-black" : "hover:bg-gray-800"
            }`}
          >
            <Image
              src={isActive("/admin/products") ? "/admin/sidebar/product_active.svg" : "/admin/sidebar/product.svg"}
              alt="Sản phẩm"
              width={20}
              height={20}
            />
            <span className="text-lg">Sản phẩm</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/category"
            className={`flex items-center gap-3 p-2 rounded ${
              isActive("/admin/category") ? "bg-white text-black" : "hover:bg-gray-800"
            }`}
          >
            <Image
              src={isActive("/admin/category") ? "/admin/sidebar/category_active.svg" : "/admin/sidebar/category.svg"}
              alt="Danh mục"
              width={20}
              height={20}
            />
            <span className="text-lg">Danh mục</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 p-2 rounded ${
              isActive("/admin/users") ? "bg-white text-black" : "hover:bg-gray-800"
            }`}
          >
            <Image
              src={isActive("/admin/users") ? "/admin/sidebar/user_active.svg" : "/admin/sidebar/user.svg"}
              alt="Quản lý người dùng"
              width={20}
              height={20}
            />
            <span className="text-lg">Quản lý người dùng</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/settings"
            className={`flex items-center gap-3 p-2 rounded ${
              isActive("/admin/settings") ? "bg-white text-black" : "hover:bg-gray-800"
            }`}
          >
            <Image
              src={isActive("/admin/settings") ? "/admin/sidebar/setting_active.svg" : "/admin/sidebar/setting.svg"}
              alt="Cài đặt"
              width={20}
              height={20}
            />
            <span className="text-lg">Cài đặt</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}