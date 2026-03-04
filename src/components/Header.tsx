"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import { FaBars, FaRegUser, FaXmark } from "react-icons/fa6";
import { IoLogInOutline } from "react-icons/io5";
import { cn } from "../utils/cn";
import ProfileDropDown from "./drop down/PrfofileDropDown";
import CartDrawer from "./shopping cart/CartDrawer";
import { useAuth } from "../context/AuthContext";
import { Button, Modal } from "antd";
import { API_CONFIG } from "../lib/api-config";
import { getSystemUserByCompanyId } from "../lib/api-services";

const Header = () => {
  const { userSession, logout, loading: authLoading } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const router = useRouter();
  const isAuthenticated = Boolean(userSession?.accessToken);

  const companyId = useMemo(
    () => userSession?.companyId || API_CONFIG.companyId,
    [userSession?.companyId],
  );

  useEffect(() => {
    setImageLoaded(false);
  }, [logoSrc]);

  useEffect(() => {
    let mounted = true;
    const loadLogo = async () => {
      if (!companyId) return;
      try {
        const user = await getSystemUserByCompanyId(companyId);
        if (mounted && user?.companyLogo) {
          setLogoSrc(user.companyLogo);
        }
      } catch (error) {
        console.error("Failed to load company logo for header:", error);
      } finally {
        if (mounted) setIsLogoLoading(false);
      }
    };
    loadLogo();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  const handleSearch = () => {
    const query = searchTerm.trim();
    if (!query) return;
    const params = new URLSearchParams();
    params.set("search", query);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <nav className=" bg-white shadow backdrop-blur sticky top-0 z-40 border-b border-gray-200">
      <div className=" max-w-7xl px-5 mx-auto flex items-center justify-between gap-5 py-2">
        <Link href="/" className=" cursor-pointer">
          <div className="relative min-w-[80px] min-h-[40px] flex items-center justify-center">
            {(isLogoLoading || (logoSrc && !imageLoaded)) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            {logoSrc && (
              <Image
                src={logoSrc}
                alt="logo"
                width={80}
                height={40}
                unoptimized
                className={`transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            )}
          </div>
        </Link>

        {/* search by category and products name  */}

        <div className="flex-1 min-w-0 max-w-xl rounded-full border-[.1rem] border-primary flex items-center pr-1 sm:pr-2 pl-2">
          <span className=" text-lg">
            <CiSearch />
          </span>
          <input
            type="text"
            id="Search"
            placeholder="Search for..."
            className="w-full border-none outline-none bg-transparent  sm:py-2.5 py-1.5  pl-3 sm:text-sm text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <span
            onClick={handleSearch}
            className=" bg-primary text-white sm:px-3 px-2 sm:py-1 py-[2px] sm:text-base text-sm rounded-full cursor-pointer"
          >
            Search
          </span>
        </div>

        <div className="flex  gap-5 items-center">
          <div className="min-[950px]:flex hidden">
            <ul className=" flex gap-2">
              <Link
                href="/"
                className=" text-lg font-medium px-3 py-2 hover:text-primary transition-all ease-linear duration-200"
              >
                হোম
              </Link>
              <Link
                href="/products"
                className=" text-lg font-medium px-3 py-2 hover:text-primary transition-all ease-linear duration-200"
              >
                শপ
              </Link>
              <Link
                href="/flashSell"
                className=" text-lg font-medium px-3 py-2 hover:text-primary transition-all ease-linear duration-200"
              >
                ফ্ল্যাশ সেল
              </Link>
              <Link
                href="/contact-us"
                className=" text-lg font-medium px-3 py-2 hover:text-primary transition-all ease-linear duration-200"
              >
                যোগাযোগ
              </Link>
              <Link
                href="/order-tracking"
                className=" text-lg font-medium px-3 py-2 hover:text-primary transition-all ease-linear duration-200"
              >
                অর্ডার ট্র্যাকিং
              </Link>

              {/* <Link
                href="/reseller"
                className=" text-lg font-medium px-3 py-2 hover:text-primary transition-all ease-linear duration-200"
              >
                রিসেলার
              </Link>  */}
            </ul>
          </div>
          <div className=" flex gap-4 items-center  ">
            {/* <div className=" md:block  hidden text-2xl cursor-pointer">
              <TbCategoryPlus />
            </div> */}
            <div className="md:block hidden">
              <CartDrawer />
            </div>
            <div className="md:block hidden">
              {authLoading ? (
                <div className="h-9 w-20 rounded-full border border-gray-200 bg-gray-50" />
              ) : isAuthenticated ? (
                <ProfileDropDown />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 ease-linear"
                  >
                    <IoLogInOutline size={18} />
                    লগইন
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primaryDark transition-colors duration-200 ease-linear"
                  >
                    <FaRegUser size={16} />
                    রেজিস্টার
                  </Link>
                </div>
              )}
            </div>
            <div
              onClick={() => setToggle(!toggle)}
              className=" py-2 pl-2 min-[950px]:hidden flex text-2xl cursor-pointer"
            >
              {toggle ? <FaXmark /> : <FaBars />}
            </div>
          </div>
        </div>
      </div>
      {/* small device menu bar  */}

      <div
        className={`bg-white shadow-md absolute backdrop-blur-xl min-[950px]:hidden block transition-all ease-linear duration-200 border-r border-gray-200 ${cn(
          toggle ? "left-0" : "-left-80",
          toggle && "right-0",
        )}`}
      >
        <ul className=" flex flex-col bg gap-2">
          <Link
            onClick={() => setToggle(!toggle)}
            href="/"
            className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200  hover:bg-primary/5"
          >
            হোম
          </Link>

          <Link
            onClick={() => setToggle(!toggle)}
            href="/products"
            className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
          >
            শপ
          </Link>
          <Link
            onClick={() => setToggle(!toggle)}
            href="/flashSell"
            className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
          >
            ফ্ল্যাশ সেল
          </Link>
          <Link
            onClick={() => setToggle(!toggle)}
            href="/contact-us"
            className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
          >
            যোগাযোগ
          </Link>
          <Link
            onClick={() => setToggle(!toggle)}
            href="/order-tracking"
            className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
          >
            অর্ডার ট্র্যাকিং
          </Link>

          {/* <Link
            onClick={() => setToggle(!toggle)}
            href="/reseller"
            className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
          >
            রিসেলার
          </Link> */}
          {!authLoading && !isAuthenticated && (
            <>
              <Link
                onClick={() => setToggle(!toggle)}
                href="/login"
                className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
              >
                লগইন
              </Link>
              <Link
                onClick={() => setToggle(!toggle)}
                href="/register"
                className=" text-lg font-medium px-5 py-2 hover:text-primary transition-all ease-linear duration-200 hover:bg-primary/5"
              >
                রেজিস্টার
              </Link>
            </>
          )}
          {isAuthenticated && (
            <div className="px-5 py-2">
              <ProfileDropDown onMenuAction={() => setToggle(false)} />
            </div>
          )}
        </ul>
      </div>

      <Modal
        title="লগআউট"
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setLogoutModalOpen(false)}>
            বাতিল
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            onClick={() => {
              logout();
              setLogoutModalOpen(false);
            }}
          >
            হ্যাঁ, লগআউট
          </Button>,
        ]}
      >
        <p>আপনি কি নিশ্চিত লগআউট করতে চান?</p>
      </Modal>
    </nav>
  );
};

export default Header;
