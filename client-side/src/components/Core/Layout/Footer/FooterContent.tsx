// src/components/Core/Layout/Footer/FooterContent.tsx
import Link from "next/link";
import React from "react";

interface FooterContentProps {
  content: Array<string | { text: string; href?: string; icon?: React.ReactNode }>;
}

export default function FooterContent({ content }: FooterContentProps) {
  return (
    <div className="mt-2 text-left text-sm text-[#707070] space-y-1">
      {content.map((item, index) =>
        typeof item === "string" ? (
          <p key={index}>{item}</p>
        ) : item.href ? (
          <Link
            key={index}
            href={item.href}
            className="block text-[#707070] hover:underline"
          >
            {item.text}
          </Link>
        ) : (
          <p key={index} className="flex items-center gap-2">
            {item.icon}
            {item.text}
          </p>
        )
      )}
    </div>
  );
}