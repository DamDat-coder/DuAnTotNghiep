"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = () => {
    setIsOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) setHasUnread(false);
      return nextOpen;
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleClick}
        className={`rounded-full flex items-center justify-center transition-all p-[7px] ${
          isOpen ? "bg-[#009EFF]/[0.32]" : "hover:bg-gray-100"
        }`}
      >
        <div className="flex items-center justify-center">
          <Image
            src={
              isOpen
                ? "/nav/notification_3.svg"
                : hasUnread
                ? "/nav/notification_2.svg"
                : "/nav/notification_1.svg"
            }
            alt="notification"
            width={21}
            height={21}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] bg-white shadow-xl rounded-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-black">Thông báo</span>
            <button
              className="text-sm text-gray-500 hover:text-black"
              onClick={() => setHasUnread(false)}
            >
              Đánh dấu đã đọc
            </button>
          </div>

          <ul className="divide-y">
            <li className="flex gap-3 px-4 py-3 bg-[#ECF8FF]">
              <Image
                src="/notification/new-product.svg"
                alt="icon"
                width={20}
                height={20}
              />
              <div className="ml-2">
                <p className="font-bold text-[15px]">Sản phẩm mới</p>
                <p className="text-[14px] text-gray-600">
                  Ra mắt bộ sưu tập mùa hè 2025 – phong cách năng động, hiện
                  đại.
                  <span className="ml-1 text-[13px] text-gray-400">
                    10 phút trước
                  </span>
                </p>
              </div>
            </li>
            <li className="flex gap-3 px-4 py-3">
              <Image
                src="/notification/news.svg"
                alt="icon"
                width={20}
                height={20}
              />
              <div className="ml-2">
                <p className="font-bold text-[15px]">Tin tức mới</p>
                <p className="text-[14px] text-gray-600">
                  5 xu hướng thời trang nam nữ nổi bật nhất tháng 6 bạn không
                  nên bỏ lỡ.
                  <span className="ml-1 text-[13px] text-gray-400">
                    2 giờ trước
                  </span>
                </p>
              </div>
            </li>
            <li className="flex gap-3 px-4 py-3">
              <Image
                src="/notification/voucher.svg"
                alt="icon"
                width={20}
                height={20}
              />
              <div className="ml-2">
                <p className="font-bold text-[15px]">Mã giảm giá</p>
                <p className="text-[14px] text-gray-600">
                  Nhập mã <strong>SUMMER25</strong> để được giảm 25% cho đơn
                  hàng từ 499K.
                  <span className="ml-1 text-[13px] text-gray-400">
                    1 ngày trước
                  </span>
                </p>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
