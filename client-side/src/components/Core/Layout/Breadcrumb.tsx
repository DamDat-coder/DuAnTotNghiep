"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProductById } from "@/services/productApi";
import { IProduct } from "@/types/product";

export default function Breadcrumb() {
  const pathname = usePathname();
  const [productName, setProductName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Chia nhỏ pathname thành các đoạn
  const pathSegments = pathname.split("/").filter((segment) => segment);

  // Không hiển thị breadcrumb trên trang chủ
  if (pathname === "/") {
    return null;
  }

  // Lấy tên sản phẩm nếu đường dẫn là chi tiết sản phẩm
  useEffect(() => {
    if (pathSegments[0] === "products" && pathSegments.length === 2) {
      const productId = pathSegments[1];
      setIsLoading(true);
      fetchProductById(productId)
        .then((product: IProduct | null) => {
          if (product) {
            setProductName(product.name);
          } else {
            setProductName(null);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setProductName(null);
          setIsLoading(false);
        });
    }
  }, [pathname]);

  return (
    <nav className="text-base w-full overflow-x-auto">
      <ul className="flex items-center gap-2 whitespace-nowrap">
        {/* Trang chủ */}
        <li className="flex items-center whitespace-nowrap">
          <Link href="/" className="text-[#d1d1d1] hover:underline">
            Trang chủ
          </Link>
        </li>

        {/* Các đoạn tiếp theo */}
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          let label: string;

          if (
            isLast &&
            pathSegments[0] === "products" &&
            pathSegments.length === 2
          ) {
            label = isLoading ? "Đang tải..." : productName || segment;
          } else {
            label =
              segment === "products"
                ? "Sản phẩm"
                : segment.charAt(0).toUpperCase() + segment.slice(1);
          }

          return (
            <li
              key={href}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-[#d1d1d1]">{">"}</span>
              {isLast ? (
                <span className="text-black font-bold">{label}</span>
              ) : (
                <Link href={href} className="text-[#d1d1d1] hover:underline">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
