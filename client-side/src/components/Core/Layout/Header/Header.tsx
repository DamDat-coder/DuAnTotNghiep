"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useMenu } from "@/contexts/MenuContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLookup } from "@/contexts/LookupContext";
import DesktopNav from "./DesktopNav";
import UserDropdown from "./UserDropdown";
import MobileMenu from "../MobileMenu/MobileMenu";
import LoginPopup from "../Popups/LoginPopup";
import RegisterPopup from "../Popups/RegisterPopup";
import SearchInput from "../Popups/LookupMenu/SearchInput";
import SearchSuggestions from "../Popups/LookupMenu/SearchSuggestions";
import SearchResults from "../Popups/LookupMenu/SearchResults";
import { fetchProducts } from "@/services/productApi";
import { IProduct } from "@/types/product";
import { motion } from "framer-motion";
import Link from "next/link";
import NotificationIcon from "./Notification";
import { debounce } from "lodash";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { isOpen: isMenuOpen, setIsOpen: setIsMenuOpen } = useMenu();
  const { user, openLoginWithData, setOpenLoginWithData, registerFormData } = useAuth();
  const { isLookupOpen, setIsLookupOpen } = useLookup();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lookupButtonRef = useRef<HTMLButtonElement>(null);

  // Xác định client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Mở LoginPopup khi đăng ký thất bại
  useEffect(() => {
    if (openLoginWithData) {
      setIsLoginOpen(true);
      setOpenLoginWithData(false); // Reset sau khi mở
    }
  }, [openLoginWithData, setOpenLoginWithData]);

  // Lấy danh sách sản phẩm từ API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Debounce tìm kiếm để cải thiện hiệu suất
  const debouncedSearch = debounce((term: string) => {
    if (term.trim() === "") {
      setFilteredProducts([]);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, 300);

  // Lọc sản phẩm khi searchTerm thay đổi
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, products]);

  // Đóng menu tìm kiếm khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !inputRef.current?.contains(target) &&
        !menuRef.current?.contains(target) &&
        !lookupButtonRef.current?.contains(target)
      ) {
        setIsLookupOpen(false);
      }
    };
    if (isLookupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLookupOpen, setIsLookupOpen]);

  // Debug trạng thái tìm kiếm
  useEffect(() => {
    if (isLookupOpen) {
      console.log("Lookup is active", {
        searchTerm,
        inputRef: inputRef.current,
        menuRef: menuRef.current,
      });
    }
  }, [isLookupOpen, searchTerm]);

  const suggestions = products.map((product) => product.name).slice(0, 3);
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setIsLookupOpen(false);
  };

  return (
    <>
      <nav
        className="bg-white text-black relative"
        aria-label="Main navigation"
      >
        <div className="w-full mx-auto px-4 max-w-[2560px] laptop:px-8 desktop:px-8">
          <div className="flex h-16 items-center gap-[32%] relative">
            <Link href="/" className="flex items-center" aria-label="Trang chủ">
              <Image
                src="/nav/logo.svg"
                alt="Logo"
                width={120}
                height={40}
                className="h-auto w-auto"
                draggable={false}
                loading="lazy"
              />
            </Link>

            <DesktopNav />
            <div className="flex items-center gap-3 w-[13.9375rem] justify-end absolute right-0">
              <div className="flex items-center gap-3 relative">
                <div className="w-6 h-6 relative">
                  {isLookupOpen ? (
                    <div className="absolute -top-2 right-0 w-[15.625rem] z-[999] shadow-lg rounded-full">
                      <div className="bg-white z-[999] shadow-lg rounded-lg">
                        <motion.div
                          ref={inputRef}
                          initial={{ width: "24px", opacity: 0, x: 226 }}
                          animate={{ width: "15.625rem", opacity: 1, x: 0 }}
                          exit={{ width: "24px", opacity: 0, x: 226 }}
                          transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                          }}
                        >
                          <SearchInput
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            setIsOpen={setIsLookupOpen}
                            isMobile={false}
                          />
                        </motion.div>
                        <motion.div
                          ref={menuRef}
                          className="text-black w-full max-h-96 overflow-hidden flex flex-col z-[40]"
                          initial={{ y: "-8%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-8%", opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20,
                          }}
                        >
                          <div className="flex-1 overflow-y-auto px-2 py-4">
                            {isLoading ? (
                              <div
                                className="sk-chase"
                                role="status"
                                aria-label="Đang tải"
                              >
                                <div className="sk-chase-dot"></div>
                                <div className="sk-chase-dot"></div>
                                <div className="sk-chase-dot"></div>
                                <div className="sk-chase-dot"></div>
                                <div className="sk-chase-dot"></div>
                                <div className="sk-chase-dot"></div>
                              </div>
                            ) : filteredProducts.length === 0 &&
                              searchTerm.trim() !== "" ? (
                              <p className="text-center text-gray-500">
                                Không tìm thấy sản phẩm
                              </p>
                            ) : (
                              <div className="flex flex-col gap-6">
                                {searchTerm.trim() === "" ? (
                                  <SearchSuggestions
                                    suggestions={suggestions}
                                    handleSuggestionClick={
                                      handleSuggestionClick
                                    }
                                    onClick={handleSuggestionClick}
                                  />
                                ) : (
                                  <SearchResults
                                    filteredProducts={filteredProducts}
                                    searchTerm={searchTerm}
                                    isMobile={false}
                                    products={products}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      ref={lookupButtonRef}
                      className="text-gray-400 hover:text-black absolute top-0 right-0 w-6 h-6"
                      onClick={() => setIsLookupOpen(true)}
                      aria-label="Mở tìm kiếm"
                      aria-expanded={isLookupOpen}
                    >
                      <Image
                        src="/nav/nav_lookup.svg"
                        alt="Tìm kiếm"
                        width={24}
                        height={24}
                        className="h-6 w-auto"
                      />
                    </button>
                  )}
                </div>

                <Link
                  href="/profile?tab=favorite"
                  className="text-gray-400 hover:text-black hidden tablet:hidden laptop:block desktop:block"
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

                <NotificationIcon />

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

                {isClient &&
                  (user ? (
                    <UserDropdown />
                  ) : (
                    <button
                      type="button"
                      className="hidden tablet:hidden laptop:block desktop:block text-gray-400 hover:text-black"
                      onClick={() => setIsLoginOpen(true)}
                      aria-label="Đăng nhập"
                    >
                      <Image
                        src="/nav/nav_user.svg"
                        alt="Người dùng"
                        width={24}
                        height={24}
                        className="h-6 w-auto"
                      />
                    </button>
                  ))}
                <button
                  type="button"
                  className="laptop:hidden desktop:hidden text-gray-400 hover:text-black"
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Mở menu di động"
                  aria-expanded={isMenuOpen}
                >
                  <Image
                    src="/nav/nav_bugger.svg"
                    alt="Menu"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
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