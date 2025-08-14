// src/components/Core/Layout/Footer/Footer.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { footerSections } from "./data";
import FooterSection from "./FooterSection";

export default function Footer() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <footer className="text-center text-black px-4 border-t-2 border-[#B0B0B0] laptop:border-solid desktop:border-solid">
      <div className="w-full mx-auto max-w-[2560px] pt-4 desktop:w-[70%] desktop:pb-4 laptop:w-[70%] laptop:pb-4">
        {/* Grid: 1 cột mobile, 2 cột tablet, 3 cột desktop */}
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-1 laptop:grid-cols-3 desktop:grid-cols-3">
          {footerSections.map((section) => (
            <FooterSection
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
              activeSection={activeSection}
              handleClick={handleClick}
            />
          ))}
        </div>

        {/* Copyright và Social Links */}
        <div className="laptop:pt-12 desktop:pt-12 flex flex-col laptop:flex-row desktop:flex-row justify-between items-center text-left text-black text-[1rem] font-medium">
          <p>@ 2025 Shop For Real. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
