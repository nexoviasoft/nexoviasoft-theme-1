import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { theme } from "@/theme/antd";
import { hindSiliguriFonts } from "@/app/fonts";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fiberace - T-Shirt Brand",
    template: "%s | Fiberace",
  },
  description: "FreeStyle - Premium T-shirt brand. Shop quality menswear and stylish apparel.",
  keywords: ["t-shirt", "menswear", "apparel", "FreeStyle", "Fiberace", "fashion", "clothing"],
  authors: [{ name: "Fiberace" }],
  creator: "Fiberace",
  openGraph: {
    title: "Fiberace - T-Shirt Brand",
    description: "Fiberace - Premium T-shirt brand. Shop quality menswear and stylish apparel.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiberace - T-Shirt Brand",
    description: "Fiberace - Premium T-shirt brand. Shop quality menswear and stylish apparel.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          className={`${hindSiliguriFonts.variable} font-hindSiliguri antialiased bg-white text-black`}
        >
          <AuthProvider>
            <Toaster />
            <CartProvider>
              <AntdRegistry>
                <Header />
                <FlashSaleBanner />
                <div className="min-h-screen">{children}</div>
                <Footer />
                <BottomNav />
              </AntdRegistry>
            </CartProvider>
          </AuthProvider>
        </body>
      </html>
    </ConfigProvider>
  );
}
