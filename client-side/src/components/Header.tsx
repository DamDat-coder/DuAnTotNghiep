// src/components/Header.tsx
"use client";

import React, { useState } from "react";
import MobileMenu from "./MobileMenu";
import LookupMenu from "./LookupMenu"; // Import component mới

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State cho MobileMenu
  const [isLookupOpen, setIsLookupOpen] = useState(false); // State cho LookupMenu

  return (
    <nav className="bg-white text-black">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img src="/nav/logo.svg" alt="Logo" className="h-auto" />
          </div>

          {/* CTA */}
          <div className="cta">
            {/* Icons và hamburger */}
            <div className="flex items-center space-x-[0.75rem] tablet:hidden">
              {/* Nút Lookup */}
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsLookupOpen(!isLookupOpen)} // Toggle LookupMenu
              >
                <img src="/nav/nav_lookup.svg" alt="Lookup" className="h-6 w-auto" />
              </button>
              <a href="#">
                <img src="/nav/nav_user.svg" alt="Nav User" className="h-6 w-auto" />
              </a>
              <a href="#">
                <img src="/nav/nav_cart.svg" alt="Nav Cart" className="h-6 w-auto" />
              </a>
              {/* Nút Hamburger */}
              <button
                type="button"
                className="text-gray-400 hover:text-black focus:ring-2 focus:ring-gray-300 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)} // Toggle MobileMenu
              >
                <img src="/nav/nav_bugger.svg" alt="Menu" />
              </button>
            </div>

            {/* Menu tablet/desktop */}
            <div className="hidden tablet:flex space-x-4">
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Dashboard
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Team
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:bg-gray-200 rounded">
                Projects
              </a>
            </div>

            {/* Menu mobile fullscreen */}
            <MobileMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
            <LookupMenu isOpen={isLookupOpen} setIsOpen={setIsLookupOpen} />
          </div>
        </div>
      </div>
    </nav>
  );
}