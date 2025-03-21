"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleClick = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <footer className=" text-center text-black px-4">
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {[
          {
            id: "policies",
            title: "Chính sách & Quy định",
            content: [
              "Điều khoản & Điều kiện",
              "Chính sách thanh toán",
              "Chính sách xác minh thông tin",
              "Câu hỏi thường gặp",
              "Chính sách hủy và hoàn tiền",
            ],
          },
          {
            id: "contact",
            title: "Liên hệ",
            content: [
              {
                icon: <MapPin size={16} />,
                text: "Đ. Tô Ký, Tân Hưng Thuận, Quận 12, HCM",
              },
              { icon: <Mail size={16} />, text: "dsun.agency@gmail.com" },
              { icon: <Phone size={16} />, text: "0705 768 791" },
            ],
          },
          {
            id: "about_us",
            title: "Về chúng tôi",
            content: [
              "GBOX cung cấp dịch vụ thuê nơi chụp với không gian căn hộ sang trọng và view đẹp. Chúng tôi cam kết mang đến cho bạn không gian hoàn hảo để tạo nên những bức ảnh ấn tượng với mức giá hợp lý.",
            ],
          },
        ].map(({ id, title, content }) => (
          <div key={id}>
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
              className="overflow-hidden mt-2 text-left text-sm text-[#B0B0B0] space-y-1"
            >
              {content.map((item, index) =>
                typeof item === "string" ? (
                  <p key={index}>{item}</p>
                ) : (
                  <p key={index} className="flex items-center gap-2">
                    {item.icon}
                    {item.text}
                  </p>
                )
              )}
            </motion.div>
          </div>
        ))}
        <p className="text-left text-[1rem] border-t-2 border-[#B0B0B0]">&copy; 2025 Have A Trip. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
