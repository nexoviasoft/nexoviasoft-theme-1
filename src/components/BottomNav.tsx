"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegUser } from "react-icons/fa6";
import { GoHome } from "react-icons/go";
import { TbCategoryPlus } from "react-icons/tb";
import { IoFlash } from "react-icons/io5";
import { MdOutlineContactSupport } from "react-icons/md";
import CartDrawer from "./shopping cart/CartDrawer";

const BottomNav = () => {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const premiumLabel = "text-[10px] leading-none font-medium tracking-wide";
  const itemBase =
    "py-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 ease-linear";
  const iconBase = "text-2xl";

  return (
    <div className="md:hidden block sticky left-0 right-0 bottom-0 border-t border-gray-300 bg-white/95 backdrop-blur">
      <div className="w-full grid grid-cols-5 gap-1 items-center px-2">
        {/* Home */}
        <Link
          href="/"
          className={`${itemBase} ${
            isActive("/") ? "text-primary" : "text-gray-700 hover:text-primary"
          }`}
        >
          <span className={iconBase}>
            <GoHome />
          </span>
          <span className={premiumLabel}>হোম</span>
        </Link>

        {/* Flash Sale */}
        <Link
          href="/flashSell"
          className={`${itemBase} ${
            isActive("/flashSell")
              ? "text-primary"
              : "text-gray-700 hover:text-primary"
          }`}
        >
          <span className={iconBase}>
            <IoFlash />
          </span>
          <span className={premiumLabel}>ফ্ল্যাশ সেল</span>
        </Link>

        {/* Products */}
        <Link
          href="/products"
          className={`${itemBase} ${
            isActive("/products")
              ? "text-primary"
              : "text-gray-700 hover:text-primary"
          }`}
        >
          <span className={iconBase}>
            <TbCategoryPlus />
          </span>
          <span className={premiumLabel}>পণ্যসমূহ</span>
        </Link>

        {/* Cart */}
        {/* <div className={`${itemBase} text-gray-700 hover:text-primary`}>
          <CartDrawer />
          <span className={premiumLabel}>কার্ট</span>
        </div> */}

        {/* Contact */}
        <Link
          href="/contact-us"
          className={`${itemBase} ${
            isActive("/contact-us")
              ? "text-primary"
              : "text-gray-700 hover:text-primary"
          }`}
        >
          <span className={iconBase}>
            <MdOutlineContactSupport />
          </span>
          <span className={premiumLabel}>যোগাযোগ</span>
        </Link>

        {/* Account */}
        <Link
          href="/my-account"
          className={`${itemBase} ${
            isActive("/my-account")
              ? "text-primary"
              : "text-gray-700 hover:text-primary"
          }`}
        >
          <span className={iconBase}>
            <FaRegUser />
          </span>
          <span className={premiumLabel}>অ্যাকাউন্ট</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
