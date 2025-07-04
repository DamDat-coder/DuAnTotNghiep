// app/layout.tsx
"use client";

import { Lora } from "next/font/google";
import { usePathname } from "next/navigation";
import "../styles/font.css";
import "./globals.css";
import { LookupProvider } from "@/contexts/LookupContext";
import Header from "../components/Core/Layout/Header/Header";
import Footer from "../components/Core/Layout/Footer/Footer";
import { MenuProvider } from "@/contexts/MenuContext";
import { AuthProvider } from "../contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ChatBotBox from "@/components/Chat/ChatBotBox";

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lora",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  const mainClassName = isAdminRoute ? "flex-1" : "flex-grow";

  return (
    <html lang="en">
      <body
        className={`${lora.variable} font-body antialiased flex flex-col min-h-screen`}
      >
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <AuthProvider>
            <MenuProvider>
              <LookupProvider>
                {!isAdminRoute && <Header title="My App" />}
                <CartProvider>
                  <WishlistProvider>
                    <main className={mainClassName}>{children}</main>
                    {!isAdminRoute && <ChatBotBox />}
                  </WishlistProvider>
                </CartProvider>
                {!isAdminRoute}
                {!isAdminRoute && <Footer />}
              </LookupProvider>
            </MenuProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
