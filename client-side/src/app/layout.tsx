// app/layout.tsx
"use client"; // Giữ "use client" để dùng usePathname

import { Lora } from "next/font/google";
import { usePathname } from "next/navigation";
import "../styles/font.css"
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Import font Lora từ Google Fonts
const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"], // Lora với weight 400 (regular) và 700 (bold)
  variable: "--font-lora", // Tạo CSS variable để sử dụng với Tailwind
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  // Class cho <main>: Chỉ áp dụng style cho userside
  const mainClassName = isAdminRoute
    ? "flex-1" // Admin side: Chỉ giữ flex-1 để full height, không thêm style khác
    : "flex-grow"; // Userside: Giữ style gốc

  return (
    <html lang="en">
      <body
        className={`${lora.variable} font-body antialiased flex flex-col min-h-screen`}
      >
        {!isAdminRoute && <Header title="My App" />}
        <main className={mainClassName}>{children}</main>
        {!isAdminRoute && <br />}
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}