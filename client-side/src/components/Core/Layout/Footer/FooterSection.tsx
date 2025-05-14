// src/components/Core/Layout/Footer/FooterSection.tsx
import React from "react";
import { motion } from "framer-motion";
import FooterContent from "./FooterContent";

interface FooterSectionProps {
  id: string;
  title: string;
  content: Array<string | { text: string; href?: string; icon?: React.ReactNode }>;
  activeSection: string | null;
  handleClick: (section: string) => void;
}

export default function FooterSection({
  id,
  title,
  content,
  activeSection,
  handleClick,
}: FooterSectionProps) {
  return (
    <div>
      {/* Mobile/Tablet: Có mũi tên và accordion */}
      <div className="laptop:hidden desktop:hidden">
        <a
          href="#"
          className="flex items-center justify-between flex-auto no-underline hover:underline focus:no-underline border-t-2 pt-4 border-[#B0B0B0]"
          onClick={(e) => {
            e.preventDefault();
            handleClick(id);
          }}
        >
          <p className="text-base font-semibold">{title}</p>
          <motion.img
            src="/nav/footer_down.svg"
            alt=""
            className="h-4 w-auto"
            animate={{ rotate: activeSection === id ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </a>
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: activeSection === id ? "auto" : 0,
            opacity: activeSection === id ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mt-2"
        >
          <FooterContent content={content} />
        </motion.div>
      </div>

      {/* Desktop: Không mũi tên, nội dung hiển thị luôn */}
      <div className="hidden laptop:block desktop:block">
        <p className="text-xl font-medium text-left">{title}</p>
        <FooterContent content={content} />
      </div>
    </div>
  );
}