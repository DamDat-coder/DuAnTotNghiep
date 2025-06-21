"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchParentCategories } from "@/services/categoryApi";
import { ICategory } from "@/types/category";
import { useAuth } from "@/contexts/AuthContext";
import LoginPopup from "../Popups/LoginPopup";
import RegisterPopup from "../Popups/RegisterPopup";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {
    user,
    openLoginWithData,
    setOpenLoginWithData,
    registerFormData,
    logout,
  } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Khóa cuộn nền khi menu mở
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, user]);

  // Lấy danh mục từ API
  useEffect(() => {
    async function loadCategories() {
      try {
        const rootCategories = await fetchParentCategories();
        console.log("Root categories:", rootCategories);
        const filteredCategories = rootCategories.filter(
          (cat: ICategory) =>
            cat.id !== "684d0f12543e02998d9df097" && cat.name !== "Bài viết"
        );
        console.log("Filtered categories:", filteredCategories);
        setCategories(filteredCategories);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi tải danh mục");
        console.error("Error loading categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Tạo navItems với mục tĩnh và động
  const navItems: NavItem[] = [
    { href: "/about", label: "Về chúng tôi" },
    ...categories.map((cat) => ({
      href: `/products?id_cate=${cat.id}`,
      label: cat.name,
    })),
    { href: "/contact", label: "Liên hệ" },
  ];

  if (!user || !user.name) {
    return (
      <>
        <motion.div
          className="fixed inset-0 text-black bg-white z-50 flex flex-col overflow-y-auto"
          initial={false}
          animate={{ translateX: isOpen ? "0%" : "100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-6 min-h-screen">
            <div className="flex items-center justify-end p-4 border-b-2 border-[#B0B0B0]">
              <button
                type="button"
                className="text-gray-400 hover:text-black"
                onClick={() => setIsOpen(false)}
              >
                <Image
                  src="/nav/Union - Copy.svg"
                  alt="Close"
                  width={120}
                  height={40}
                  className="h-6 w-auto"
                />
              </button>
            </div>
            <div className="flex flex-col p-4">
              <div className="flex flex-col gap-4">
                {navItems.length === 0 ? (
                  <p className="text-lg text-gray-500">
                    Không có mục nào để hiển thị.
                  </p>
                ) : (
                  navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium hover:underline"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex justify-between items-center text-2xl">
                        {item.label}
                        <Image
                          src="/nav/nav_angle_left.svg"
                          alt="Arrow"
                          width={120}
                          height={40}
                          className="h-auto w-auto tablet:w-2"
                          draggable={false}
                          loading="lazy"
                        />
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6 px-4 mt-auto">
              <Image
                src="/nav/logo.svg"
                alt="Logo"
                width={120}
                height={40}
                className="h-auto"
                draggable={false}
                loading="lazy"
              />
              <p className="text-base text-gray-700">
                Trở thành thành viên <span className="font-bold">Style for you</span> để có được những sản phẩm và giá tốt
                nhất.
              </p>
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="p-3 rounded-full font-bold text-base border border-solid border-black bg-black text-white"
                >
                  Đăng ký
                </button>

                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="p-3 rounded-full font-bold text-base border border-solid border-[#0000005c]"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        <LoginPopup
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onOpenRegister={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
          initialFormData={registerFormData}
        />
        <RegisterPopup
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onOpenLogin={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 text-black bg-white z-50 flex flex-col overflow-y-auto"
        initial={false}
        animate={{ translateX: isOpen ? "0%" : "100%" }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col gap-6 min-h-screen px-6 pt-6">
          <div className="flex items-center justify-end p-4 border-b-2 border-[#B0B0B0]">
            <button
              type="button"
              className="text-gray-400 hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/nav/Union - Copy.svg"
                alt="Close"
                width={120}
                height={40}
                className="h-6 w-auto"
              />
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <Image
              src="/nav/nav_user.svg"
              alt="Logo"
              width={120}
              height={40}
              className="h-6 w-6 rounded-full"
            />
            <span className="text-gray-700 text-2xl font-medium font-description">
              Hi, {user.name.split(" ").pop()}
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col gap-4">
              {navItems.length === 0 ? (
                <p className="text-lg text-gray-500">
                  Không có mục nào để hiển thị.
                </p>
              ) : (
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-lg font-medium hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex justify-between items-center text-2xl">
                      {item.label}
                      <Image
                        src="/nav/nav_angle_left.svg"
                        alt="Arrow"
                        width={120}
                        height={40}
                        className="h-auto w-auto tablet:w-2"
                        draggable={false}
                        loading="lazy"
                      />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Link
                href="/profile?tab=favorite"
                className="text-gray-400"
                aria-label="Danh sách yêu thích"
              >
                <Image
                  src="/nav/nav_like_desktop.svg"
                  alt="Yêu thích"
                  width={24}
                  height={24}
                  className="h-[1.05rem] w-auto"
                />
              </Link>
              <p className="text-2xl font-medium font-description">Yêu thích</p>
            </div>

            <div className="flex gap-4 items-center">
              <Link
                href="/cart"
                className="text-gray-400 hover:text-black"
                aria-label="Giỏ hàng"
              >
                <Image
                  src="/nav/nav_cart.svg"
                  alt="Giỏ hàng"
                  width={24}
                  height={24}
                  className="h-6 w-auto"
                />
              </Link>
              <p className="text-2xl font-medium font-description">Giỏ hàng</p>
            </div>
          </div>
          <div className="flex flex-col gap-6 px-4 mt-auto">
            <button
              className="p-3 rounded-full font-bold text-base border border-solid border-black bg-black text-white"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </motion.div>
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        initialFormData={registerFormData}
      />
      <RegisterPopup
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </>
  );
}
