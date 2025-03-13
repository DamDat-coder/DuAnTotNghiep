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
    <footer className="p-4 text-center text-black">
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
        {[
          {
            id: "policies",
            title: "Policies & Regulations",
            content: [
              "Terms & Conditions",
              "Payment Policy",
              "Information Verification Policy",
              "Frequently Asked Questions (FAQ)",
              "Cancellation & Refund Policy",
            ],
          },
          {
            id: "contact",
            title: "Contact",
            content: [
              { icon: <MapPin size={16} />, text: "Đ. Tô Ký, Tân Hưng Thuận, Quận 12, HCM" },
              { icon: <Mail size={16} />, text: "dsun.agency@gmail.com" },
              { icon: <Phone size={16} />, text: "0705 768 791" },
            ],
          },
          {
            id: "privacy",
            title: "Privacy Policy",
            content: [
              "Information Collection Policy",
              "User Data Handling",
              "Third-Party Sharing Policy",
            ],
          },
        ].map(({ id, title, content }) => (
          <div key={id}>
            <a
              href="#"
              className="flex items-center justify-between flex-auto no-underline hover:underline focus:no-underline"
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
              animate={{ height: activeSection === id ? "auto" : 0, opacity: activeSection === id ? 1 : 0 }}
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
      </div>
    </footer>
  );
}