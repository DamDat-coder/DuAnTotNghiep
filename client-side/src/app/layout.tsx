// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const customFont = Inter({
  variable: "--font-custom",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${customFont.variable} antialiased flex flex-col min-h-screen`}>
        <Header title="My App" />
        <main className="flex-grow px-4 desktop:w-[80%] desktop:mx-auto">{children}</main>
        <br />
        <Footer />
      </body>
    </html>
  );
}