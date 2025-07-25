"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationApi";
import { INotification } from "@/types/notification";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "lucide-react";

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Lấy thông báo khi mount
  useEffect(() => {
    if (!user) return; // ✅ Chưa đăng nhập => không gọi API

    async function loadNotifications() {
      try {
        const response = await fetchNotifications();
        const notificationsWithLink = response.data.map((n: any) => ({
          ...n,
          link: n.link ?? "#",
        }));
        setNotifications(notificationsWithLink);
        setHasUnread(notificationsWithLink.some((n: any) => !n.is_read));
      } catch (error: any) {
        // ✅ Nếu lỗi từ token (403), đừng hiện toast
        if (
          error?.status === 403 ||
          error?.message?.includes("Token không hợp lệ")
        ) {
          console.warn(
            "Token không hợp lệ hoặc hết hạn, bỏ qua loadNotifications"
          );
          return;
        }

        // ✅ Các lỗi khác mới hiện toast
        console.error("Lỗi khi tải thông báo:", error);
        toast.error("Không thể tải thông báo");
      }
    }

    loadNotifications();
  }, [user]);

  useEffect(() => {
    setHasUnread(notifications.some((n) => !n.is_read));
  }, [notifications]);

  // Xử lý click ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý click nút thông báo
  const handleClick = () => {
    setIsOpen((prev) => {
      const nextOpen = !prev;
      if (nextOpen) {
        setHasUnread(notifications.some((n) => !n.is_read));
      }
      return nextOpen;
    });
  };

  // Định dạng thời gian
  const formatTimeAgo = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
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
        <div className="absolute font-description right-0 mt-2 w-[320px] h-[18.75rem] overflow-y-scroll bg-white shadow-xl z-50 scroll-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <span className="font-semibold text-sm text-black">Thông báo</span>
            <button
              className="text-[0.8125rem] text-gray-500 hover:text-black"
              onClick={() => {
                const unreadIds = notifications
                  .filter((n) => !n.is_read)
                  .map((n) => n._id);
                if (unreadIds.length > 0) {
                  markAllNotificationsAsRead(unreadIds)
                    .then(() => {
                      setNotifications((prev) =>
                        prev.map((n) => ({ ...n, is_read: true }))
                      );
                      setHasUnread(false);
                    })
                    .catch(() => toast.error("Lỗi khi đánh dấu đã đọc"));
                }
              }}
            >
              Đánh dấu đã đọc
            </button>
          </div>

          <ul className="divide-y">
            {notifications.length === 0 ? (
              <li className="px-4 py-3 text-center text-gray-500 text-sm">
                {!user
                  ? "Vui lòng đăng nhập để nhận thông báo"
                  : "Không có thông báo"}
              </li>
            ) : (
              notifications.map((notification) => {
                let iconSrc = "/notification/default.svg";

                if (notification.title === "Tin tức mới từ Style For You!") {
                  iconSrc = "/notification/news.svg";
                } else if (notification.title === "Sản phẩm mới vừa ra mắt!") {
                  iconSrc = "/notification/products.svg";
                } else if (
                  notification.title === "Mã giảm giá mới vừa được xuất bản!"
                ) {
                  iconSrc = "/notification/vouchers.svg";
                } else if (
                  notification.title ===
                    "Đơn hàng của bạn đã được tạo thành công!" ||
                  notification.title === "Có đơn hàng mới!"
                ) {
                  iconSrc = "/notification/orders.svg";
                }

                const handleSingleClick = () => {
                  if (!notification.is_read) {
                    markAllNotificationsAsRead([notification._id])
                      .then(() => {
                        setNotifications((prev) =>
                          prev.map((n) =>
                            n._id === notification._id
                              ? { ...n, is_read: true }
                              : n
                          )
                        );
                      })
                      .catch(() => toast.error("Lỗi khi đánh dấu đã đọc"));
                  }
                };

                return (
                  <a key={notification._id} href={notification.link}>
                    <li
                      onClick={handleSingleClick}
                      className={`flex gap-2 px-4 py-3 cursor-pointer ${
                        !notification.is_read ? "bg-[#ECF8FF]" : ""
                      }`}
                    >
                      <Image src={iconSrc} alt="icon" width={20} height={20} />
                      <div className="">
                        <p className="font-bold text-sm">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notification.message}
                          <span className="ml-1 text-[13px] text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </p>
                      </div>
                    </li>
                  </a>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
