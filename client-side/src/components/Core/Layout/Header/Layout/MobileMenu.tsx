"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ICategory } from "@/types/category";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useActiveTab } from "@/contexts/ActiveTabContext";
import LoginPopup from "../../Popups/AuthAction/LoginPopup";
import RegisterPopup from "../../Popups/AuthAction/RegisterPopup";
import ForgotPasswordPopup from "../../Popups/PasswordAction/ForgotPasswordPopup";
import ResetPasswordPopup from "../../Popups/PasswordAction/ResetPasswordPopup";
import ChangePasswordModal from "@/components/Profile/modals/ChangePasswordModal";
import { Lock } from "lucide-react";
import { Package } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface NavItem {
  href: string;
  label: string;
  children?: ICategory[];
}

const NavList = ({
  navItems,
  expandedCategory,
  toggleCategory,
  setIsOpen,
}: {
  navItems: NavItem[];
  expandedCategory: string | null;
  toggleCategory: (categoryId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}) => (
  <div className="flex flex-col gap-4">
    {navItems.length === 0 ? (
      <p className="text-lg text-gray-500">Không có mục nào để hiển thị.</p>
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
                width={24}
                height={24}
                className={`h-auto w-3 transition-transform ${
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
);

const GuestMenu = ({
  setIsOpen,
  setIsLoginOpen,
  setIsRegisterOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
  setIsLoginOpen: (isOpen: boolean) => void;
  setIsRegisterOpen: (isOpen: boolean) => void;
}) => (
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
      Trở thành thành viên <span className="font-bold">Style for you</span> để
      có những sản phẩm và giá tốt nhất.
    </p>
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => {
          setIsRegisterOpen(true);
          setIsOpen(false);
        }}
        className="p-3 rounded-full font-bold text-base border border-solid border-black bg-black text-white"
      >
        Đăng ký
      </button>
      <button
        onClick={() => {
          setIsLoginOpen(true);
          setIsOpen(false);
        }}
        className="p-3 rounded-full font-bold text-base border border-solid border-[#0000005c]"
      >
        Đăng nhập
      </button>
    </div>
  </div>
);

const UserMenu = ({
  user,
  setIsOpen,
  setActiveTab,
  logout,
  setShowChangePassword,
}: {
  user: any;
  setIsOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  logout: () => void;
  setShowChangePassword: (show: boolean) => void;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const handleOrderClick = () => {
    setActiveTab("Đơn hàng");
    window.history.pushState({}, "", "/profile?tab=order");
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    setActiveTab("Hồ sơ");
    window.history.pushState({}, "", "/profile?tab=profile");
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pt-3 border-t border-solid border-black">
      <div className="flex flex-col gap-4">
        <button
          onClick={handleProfileClick}
          className="flex gap-4 items-center"
        >
          <Image
            src="/nav/nav_user.svg"
            alt="User"
            width={24}
            height={24}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-gray-700 text-lg font-medium font-description">
            Hi, {user?.name?.split(" ").pop() || "Khách"}
          </span>
        </button>
        <Link
          href="/profile?tab=favorite"
          className="flex gap-4 items-center"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/nav/nav_like_desktop.svg"
            alt="Yêu thích"
            width={24}
            height={24}
            className="h-5 w-auto"
          />
          <p className="text-lg font-medium font-description">Yêu thích</p>
        </Link>
        <Link
          href="/profile?tab=order"
          onClick={() => {
            setActiveTab("Đơn hàng");
            setIsDropdownOpen(false);
          }}
          className="flex gap-4 items-center"
        >
          <Package size={20} />
          <p className="text-lg font-medium font-description">Đơn hàng</p>
        </Link>
        <button
          className="flex gap-4 items-center"
          onClick={() => {
            setShowChangePassword(true);
            setIsOpen(false);
          }}
        >
          <Lock className="w-5 h-5 text-black" />
          <p className="text-lg font-medium font-description">Đổi mật khẩu</p>
        </button>
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
  );
};

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const {
    user,
    openLoginWithData,
    setOpenLoginWithData,
    registerFormData,
    logout,
  } = useAuth();
  const { setActiveTab } = useActiveTab();
  const { tree, error } = useCategories();

  const categories = tree.filter(
    (cat) =>
      cat.parentId === null &&
      cat._id !== "684d0f12543e02998d9df097" &&
      cat.name !== "Bài viết"
  );

  const navItems: NavItem[] = [
    { href: "/about", label: "Về chúng tôi" },
    ...categories.map((cat) => ({
      href: `/products?id_cate=${cat._id}`,
      label: cat.name,
      children: cat.children,
    })),
    { href: "/contact", label: "Liên hệ" },
  ];

  useEffect(() => {
    if (openLoginWithData) {
      setIsLoginOpen(true);
      setOpenLoginWithData(false);
    }
  }, [openLoginWithData, setOpenLoginWithData]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-white z-50 flex flex-col overflow-y-auto"
        initial={false}
        animate={{ translateX: isOpen ? "0%" : "100%" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
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
                width={24}
                height={24}
                className="h-6 w-auto"
              />
            </button>
          </div>
          {error && <p className="text-lg text-red-500">Lỗi: {error}</p>}
          <NavList
            navItems={navItems}
            expandedCategory={expandedCategory}
            toggleCategory={toggleCategory}
            setIsOpen={setIsOpen}
          />
          {user ? (
            <UserMenu
              user={user}
              setIsOpen={setIsOpen}
              setActiveTab={setActiveTab}
              logout={logout}
              setShowChangePassword={setShowChangePassword}
            />
          ) : (
            <GuestMenu
              setIsOpen={setIsOpen}
              setIsLoginOpen={setIsLoginOpen}
              setIsRegisterOpen={setIsRegisterOpen}
            />
          )}
        </div>
      </motion.div>
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onOpenForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotOpen(true);
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
      <ForgotPasswordPopup
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onOpenLogin={() => {
          setIsForgotOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <ResetPasswordPopup
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        token={resetToken}
      />
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
}
