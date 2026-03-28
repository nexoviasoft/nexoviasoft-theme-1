import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import AntiDevTools from "@/components/security/AntiDevTools";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { API_CONFIG } from "@/lib/api-config";
import { getSystemUserByCompanyId } from "@/lib/api-services";
import { theme } from "@/theme/antd";
import { hindSiliguriFonts, baiJamjuree } from "@/app/fonts";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { FaWhatsapp } from "react-icons/fa6";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fiberace - T-Shirt Brand",
    template: "%s | Fiberace",
  },
  description:
    "FreeStyle - Premium T-shirt brand. Shop quality menswear and stylish apparel.",
  keywords: [
    "t-shirt",
    "menswear",
    "apparel",
    "FreeStyle",
    "Fiberace",
    "fashion",
    "clothing",
  ],
  authors: [{ name: "Fiberace" }],
  creator: "Fiberace",
  openGraph: {
    title: "Fiberace - T-Shirt Brand",
    description:
      "Fiberace - Premium T-shirt brand. Shop quality menswear and stylish apparel.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiberace - T-Shirt Brand",
    description:
      "Fiberace - Premium T-shirt brand. Shop quality menswear and stylish apparel.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const systemUser = await getSystemUserByCompanyId(API_CONFIG.companyId);
  const rawPhone = (systemUser?.phone || "01996645552").replace(/[^\d]/g, "");
  const whatsappPhone = rawPhone.startsWith("88") ? rawPhone : `88${rawPhone}`;
  const whatsappHref = `https://wa.me/${whatsappPhone}`;

  return (
    <ConfigProvider theme={theme}>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
          />
        </head>
        <body
          className={`${hindSiliguriFonts.variable} ${baiJamjuree.variable} font-baiJamjuree antialiased bg-white text-black`}
        >
          <AntiDevTools />
          <AuthProvider>
            <Toaster />
            <CartProvider>
              <AntdRegistry>
                <Header />
                <FlashSaleBanner />
                <div className="min-h-screen">{children}</div>
                <Footer />
                <BottomNav />
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="fixed z-50 bottom-24 right-4 md:bottom-6 md:right-6 h-14 w-14 rounded-full bg-[#25D366] text-white shadow-xl ring-1 ring-black/10 inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                >
                  <FaWhatsapp size={28} />
                </a>
              </AntdRegistry>
            </CartProvider>
          </AuthProvider>
        </body>
      </html>
    </ConfigProvider>
  );
}
