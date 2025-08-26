// src/admin/layouts/Sidebar.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon: string;
  iconActive: string;
}

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "/admin/sidebar/dashboard.svg",
    iconActive: "/admin/sidebar/dashboard_active.svg",
  },
  {
    label: "Đơn hàng",
    href: "/admin/order",
    icon: "/admin/sidebar/order.svg",
    iconActive: "/admin/sidebar/order_active.svg",
  },
  {
    label: "Sản phẩm",
    href: "/admin/products",
    icon: "/admin/sidebar/product.svg",
    iconActive: "/admin/sidebar/product_active.svg",
  },
  {
    label: "Danh mục",
    href: "/admin/category",
    icon: "/admin/sidebar/category.svg",
    iconActive: "/admin/sidebar/category_active.svg",
  },
  {
    label: "Người dùng",
    href: "/admin/users",
    icon: "/admin/sidebar/user.svg",
    iconActive: "/admin/sidebar/user_active.svg",
  },
  {
    label: "Khuyến mãi",
    href: "/admin/coupons",
    icon: "/admin/sidebar/sale.svg",
    iconActive: "/admin/sidebar/sale_active.svg",
  },
  {
    label: "Đánh giá",
    href: "/admin/reviews",
    icon: "/admin/sidebar/comment.svg",
    iconActive: "/admin/sidebar/comment_active.svg",
  },
  {
    label: "Tin tức",
    href: "/admin/news",
    icon: "/admin/sidebar/new.svg",
    iconActive: "/admin/sidebar/new_active.svg",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Bỏ phần "/admin" khỏi pathname và href để so sánh
    const basePath = pathname.replace("/admin/", "").split("/")[0] || "";
    const hrefBasePath = href.replace("/admin/", "").split("/")[0] || "";

    // So sánh đoạn đầu tiên sau "/admin"
    return basePath === hrefBasePath;
  };

  return (
    <div
      className="
        fixed top-0 left-0 h-screen
        w-[240px] desktop:w-[285px]
        bg-black text-white flex flex-col rounded-r-3xl z-50
      "
    >
      <div className="p-4 flex flex-col gap-12 w-full h-auto">
        <Link href="/admin/dashboard">
          <Image
            src="https://res.cloudinary.com/testupload1/image/upload/v1755232178/logoTrang_dl2asd.png"
            alt="Logo Công Ty"
            width={120}
            height={40}
          />
        </Link>
        <h1 className="text-[1.5rem] font-bold">MENU</h1>
      </div>
      <nav
        className="
            flex-1
            laptop:overflow-y-auto        /* bật cuộn dọc ở laptop */
            desktop:overflow-y-visible    /* desktop giữ nguyên */
            laptop:pr-2                   /* chừa rãnh cho scrollbar ở laptop */
          "
      >
        <ul className="flex flex-col gap-4 p-4 pb-6 min-h-0">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-2 rounded ${
                  isActive(item.href)
                    ? "bg-[#ECF8FF] py-3 px-3 ml-4 rounded-xl text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                <Image
                  src={isActive(item.href) ? item.iconActive : item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                />
                <span className="text-lg">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
