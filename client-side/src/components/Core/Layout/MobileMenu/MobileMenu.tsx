"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ICategory } from "@/types/category";
import { useAuth } from "@/contexts/AuthContext";
import LoginPopup from "../Popups/LoginPopup";
import RegisterPopup from "../Popups/RegisterPopup";
import { useCategories } from "@/contexts/CategoriesContext";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  children?: ICategory[];
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const {
    user,
    openLoginWithData,
    setOpenLoginWithData,
    registerFormData,
    logout,
  } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { tree, error } = useCategories();
  const categories = tree.filter(
    (cat) =>
      cat.parentId === null &&
      cat._id !== "684d0f12543e02998d9df097" &&
      cat.name !== "Bài viết"
  );

  useEffect(() => {
    if (isOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const navItems: NavItem[] = [
    { href: "/about", label: "Về chúng tôi" },
    ...categories.map((cat) => ({
      href: `/products?id_cate=${cat._id}`,
      label: cat.name,
      children: cat.children,
    })),
    { href: "/contact", label: "Liên hệ" },
  ];

  // Xử lý mở/đóng danh mục con
  const toggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  if (!user || !user.name) {
    return (
      <>
        <motion.div
          className="fixed inset-0 text-black bg-white z-50 flex flex-col overflow-y-auto"
          initial={false}
          animate={{ translateX: isOpen ? "0%" : "100%" }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col gap-9 min-h-screen">
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
                {error && <p className="text-lg text-red-500">Lỗi: {error}</p>}
                {navItems.length === 0 ? (
                  <p className="text-lg text-gray-500">
                    Không có mục nào để hiển thị.
                  </p>
                ) : (
                  navItems.map((item) => (
                    <div key={item.href}>
                      <div
                        className="flex justify-between items-center text-2xl cursor-pointer"
                        onClick={() =>
                          item.children && item.children.length > 0
                            ? toggleCategory(item.href)
                            : setIsOpen(false)
                        }
                      >
                        <Link
                          href={item.href}
                          className="text-lg font-medium hover:underline"
                          onClick={(e) => {
                            if (item.children && item.children.length > 0) {
                              e.preventDefault();
                            }
                          }}
                        >
                          {item.label}
                        </Link>
                        {item.children && item.children.length > 0 && (
                          <Image
                            src="/nav/nav_angle_left.svg"
                            alt="Arrow"
                            width={120}
                            height={40}
                            className={`h-auto w-auto tablet:w-2 transition-transform ${
                              expandedCategory === item.href ? "rotate-90" : ""
                            }`}
                            draggable={false}
                            loading="lazy"
                          />
                        )}
                      </div>
                      <AnimatePresence>
                        {item.children &&
                          item.children.length > 0 &&
                          expandedCategory === item.href && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 mt-2 flex flex-col gap-2"
                            >
                              {item.children.map((child) => (
                                <Link
                                  key={child._id}
                                  href={`/products?id_cate=${child._id}`}
                                  className="text-base font-medium text-gray-600 hover:underline"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6 px-4">
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
                Trở thành thành viên{" "}
                <span className="font-bold">Style for you</span> để có được
                những sản phẩm và giá tốt nhất.
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
              alt="User"
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
              {error && <p className="text-lg text-red-500">Lỗi: {error}</p>}
              {navItems.length === 0 ? (
                <p className="text-lg text-gray-500">
                  Không có mục nào để hiển thị.
                </p>
              ) : (
                navItems.map((item) => (
                  <div key={item.href}>
                    <div
                      className="flex justify-between items-center text-2xl cursor-pointer"
                      onClick={() =>
                        item.children && item.children.length > 0
                          ? toggleCategory(item.href)
                          : setIsOpen(false)
                      }
                    >
                      <Link
                        href={item.href}
                        className="text-lg font-medium hover:underline"
                        onClick={(e) => {
                          if (item.children && item.children.length > 0) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {item.label}
                      </Link>
                      {item.children && item.children.length > 0 && (
                        <Image
                          src="/nav/nav_angle_left.svg"
                          alt="Arrow"
                          width={120}
                          height={40}
                          className={`h-auto w-auto tablet:w-2 transition-transform ${
                            expandedCategory === item.href ? "rotate-90" : ""
                          }`}
                          draggable={false}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <AnimatePresence>
                      {item.children &&
                        item.children.length > 0 &&
                        expandedCategory === item.href && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-4 mt-2 flex flex-col gap-2"
                          >
                            {item.children.map((child) => (
                              <Link
                                key={child._id}
                                href={`/products?id_cate=${child._id}`}
                                className="text-base font-medium text-gray-600 hover:underline"
                                onClick={() => setIsOpen(false)}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Link
              href="/profile?tab=favorite"
              className="flex gap-4 items-center w-[15%] justify-between"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/nav/nav_like_desktop.svg"
                alt="Yêu thích"
                width={24}
                height={24}
                className="h-5 w-auto"
              />
              <p className="text-2xl font-medium font-description">Yêu thích</p>
            </Link>
            <Link
              href="/cart"
              className="flex gap-4 items-center w-[15%] justify-between"
              onClick={() => setIsOpen(false)}
            >
              <Image
                src="/nav/nav_cart.svg"
                alt="Giỏ hàng"
                width={24}
                height={24}
                className="h-6 w-auto"
              />
              <p className="text-2xl font-medium font-description">Giỏ hàng</p>
            </Link>
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
