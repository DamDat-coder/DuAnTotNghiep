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

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { isOpen: isMenuOpen, setIsOpen: setIsMenuOpen } = useMenu();
  const { user } = useAuth();
  const { isLookupOpen, setIsLookupOpen } = useLookup();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<IProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLDivElement>(null); // Ref cho vùng input
  const menuRef = useRef<HTMLDivElement>(null); // Ref cho panel gợi ý/kết quả

  // Xác định client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lấy danh sách sản phẩm từ API khi component mount
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  // Lọc sản phẩm khi searchTerm thay đổi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts([]);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Đóng menu khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !inputRef.current?.contains(target) &&
        !menuRef.current?.contains(target) &&
        !target.closest('button[aria-label="Open Lookup"]')
      ) {
        console.log("Closing lookup, target:", target);
        setIsLookupOpen(false);
      } else {
        console.log("Click inside, target:", target);
      }
    };
    if (isLookupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLookupOpen, setIsLookupOpen]);

  // Debug trạng thái isLookupOpen
  useEffect(() => {
    if (isLookupOpen) {
      console.log("Lookup is active");
      console.log("Search term:", searchTerm);
      console.log("inputRef:", inputRef.current);
      console.log("menuRef:", menuRef.current);
    }
  }, [isLookupOpen, searchTerm]);

  const suggestions = products.map((product) => product.name).slice(0, 3);
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  return (
    <>
      <nav className="bg-white text-black relative">
        <div className="w-[95%] mx-auto px-4 max-w-[2560px] laptop:px-8 desktop:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
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

            <div className="flex items-center gap-3">
              {/* Desktop Actions */}
              <div className="flex items-center gap-3 relative">
                <div className="w-6 h-6 relative">
                  {isLookupOpen ? (
                    <div className="absolute -top-3 right-0 w-[19.5rem]">
                      <motion.div
                        ref={inputRef}
                        initial={{ width: "24px", opacity: 0, x: 226 }}
                        animate={{ width: "19.5rem", opacity: 1, x: 0 }}
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
                      {/* Panel gợi ý và kết quả tìm kiếm */}
                      <motion.div
                        ref={menuRef}
                        className="bg-white text-black absolute top-18 right-0 w-full max-h-96 overflow-hidden flex flex-col z-[40] shadow-lg rounded-b-lg"
                        initial={{ y: "-8%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "-8%", opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 20,
                        }}
                      >
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                          {isLoading ? (
                            <p className="text-base text-gray-500">
                              Đang tải...
                            </p>
                          ) : (
                            <div className="flex flex-col gap-6">
                              {searchTerm.trim() === "" ? (
                                <div>
                                  <SearchSuggestions
                                    suggestions={suggestions}
                                    handleSuggestionClick={
                                      handleSuggestionClick
                                    }
                                    onClick={function (
                                      suggestion: string
                                    ): void {
                                      throw new Error(
                                        "Function not implemented."
                                      );
                                    }}
                                  />
                                </div>
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
                  ) : (
                    <button
                      type="button"
                      className="text-gray-400 hover:text-black  absolute top-0 right-0 w-6 h-6"
                      onClick={() => setIsLookupOpen(true)}
                      aria-label="Open Lookup"
                    >
                      <Image
                        src="/nav/nav_lookup.svg"
                        alt="Lookup"
                        width={120}
                        height={40}
                        className="h-6 w-auto"
                      />
                    </button>
                  )}
                </div>
                <Link
                  href="/profile?tab=favorite"
                  className="text-gray-400 hover:text-black hidden tablet:hidden laptop:block desktop:block"
                >
                  <Image
                    src="/nav/nav_like_desktop.svg"
                    alt="Like"
                    width={120}
                    height={40}
                    className="h-[1.05rem] w-auto"
                  />
                </Link>
                <NotificationIcon />
                <a href="/cart" className="text-gray-400 hover:text-black">
                  <Image
                    src="/nav/nav_cart.svg"
                    alt="Cart"
                    width={120}
                    height={40}
                    className="h-6 w-auto"
                  />
                </a>
                {isClient &&
                  (user ? (
                    <UserDropdown />
                  ) : (
                    <button
                      type="button"
                      className="hidden tablet:hidden laptop:block desktop:block text-gray-400 hover:text-black "
                      onClick={() => setIsLoginOpen(true)}
                    >
                      <Image
                        src="/nav/nav_user.svg"
                        alt="User"
                        width={120}
                        height={40}
                        className="h-6 w-auto"
                      />
                    </button>
                  ))}
                <button
                  type="button"
                  className="laptop:hidden desktop:hidden text-gray-400 hover:text-black "
                  onClick={() => setIsMenuOpen(true)}
                >
                  <Image
                    src="/nav/nav_bugger.svg"
                    alt="Menu"
                    width={120}
                    height={40}
                    className="h-6 w-auto"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Render các popup ở cấp cao nhất */}
      <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <LoginPopup
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => setIsRegisterOpen(true)}
      />
      <RegisterPopup
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />
    </>
  );
}
