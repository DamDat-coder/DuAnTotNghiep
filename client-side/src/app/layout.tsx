"use client"; // Giữ "use client" để dùng usePathname

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const customFont = Inter({
  variable: "--font-custom",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  // Class cho <main>: Chỉ áp dụng style cho userside
  const mainClassName = isAdminRoute
    ? "flex-1" // Admin side: Chỉ giữ flex-1 để full height, không thêm style khác
    : "flex-grow px-4 desktop:w-[80%] desktop:mx-auto"; // Userside: Giữ style gốc

  return (
    <html lang="en">
      <body className={`${customFont.variable} antialiased flex flex-col min-h-screen`}>
        {!isAdminRoute && <Header title="My App" />}
        <main className={mainClassName}>{children}</main>
        {!isAdminRoute && <br />}
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  );
}