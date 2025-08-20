"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationApi";
import { INotification } from "@/types/notification";
import { motion } from "framer-motion";

export default function AdminNotification() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetchNotifications();
        // Chỉ lấy thông báo loại đơn hàng
        const orderNotis = response.data
          .filter((n: any) => n.type === "order")
          .map((n: any) => ({
            ...n,
            link: n.link ?? "", // Ensure 'link' property exists
          }));
        setNotifications(orderNotis);
        setHasUnread(orderNotis.some((n: any) => !n.is_read));
      } catch (error: any) {
        toast.error("Không thể tải thông báo");
      }
    }
    loadNotifications();
  }, []);

  useEffect(() => {
    setHasUnread(notifications.some((n) => !n.is_read));
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = () => setIsOpen((prev) => !prev);

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

  // Logic rung: chỉ áp dụng cho /nav/notification_3.svg
  const shouldShake = hasUnread && !isOpen;

  // Hiệu ứng động cho chuông
  const bellVariants = {
    shake: {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2,
      },
    },
    static: {},
  };

  // Xác định nguồn hình ảnh
  const iconSrc = isOpen
    ? "/nav/notification_3.svg"
    : hasUnread
    ? "/nav/notification_3.svg"
    : "/nav/notification_1.svg";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleClick}
        className={`rounded-full flex items-center justify-center transition-all p-[7px] ${
          isOpen ? "bg-[#009EFF]/[0.32]" : "hover:bg-gray-100"
        }`}
      >
        <div className="relative flex items-center justify-center">
          {iconSrc === "/nav/notification_3.svg" && shouldShake ? (
            <motion.div variants={bellVariants} animate="shake">
              <Image
                src={iconSrc}
                alt="notification"
                width={24}
                height={24}
                className="text-black"
              />
            </motion.div>
          ) : (
            <Image
              src={iconSrc}
              alt="notification"
              width={24}
              height={24}
              className="text-black"
            />
          )}
          {hasUnread && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          )}
        </div>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[320px] max-h-[20rem] overflow-y-auto bg-white shadow-xl z-50 rounded-xl">
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
                Không có thông báo
              </li>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`flex gap-2 px-4 py-3 cursor-pointer ${
                    !notification.is_read ? "bg-[#ECF8FF]" : ""
                  }`}
                >
                  <Image
                    src="/notification/orders.svg"
                    alt="icon"
                    width={20}
                    height={20}
                  />
                  <div>
                    <p className="font-bold text-sm">{notification.title}</p>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                      <span className="ml-1 text-[13px] text-gray-400">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
