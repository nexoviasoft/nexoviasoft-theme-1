"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CiSearch } from "react-icons/ci";
import { FaBars, FaRegUser, FaXmark } from "react-icons/fa6";
import { IoLogInOutline } from "react-icons/io5";
import { cn } from "../utils/cn";
import ProfileDropDown from "./drop down/PrfofileDropDown";
import CartDrawer from "./shopping cart/CartDrawer";
import { useAuth } from "../context/AuthContext";
import { Button, Modal } from "antd";
import { API_CONFIG } from "../lib/api-config";
import {
  getFlashSaleProducts,
  getSystemUserByCompanyId,
  Product,
} from "../lib/api-services";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import CountDown from "../app/_components/Flash Sale/CountDown";
import formatteeNumber from "../utils/formatteNumber";

const Header = () => {
  const { userSession, logout, loading: authLoading } = useAuth();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [isLogoLoading, setIsLogoLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [flashSaleModalOpen, setFlashSaleModalOpen] = useState(false);
  const [flashSaleModalLoading, setFlashSaleModalLoading] = useState(false);
  const [flashSaleModalProducts, setFlashSaleModalProducts] = useState<
    Product[]
  >([]);
  const [flashSaleModalTotalCount, setFlashSaleModalTotalCount] = useState(0);
  const [flashSaleModalMaxDiscount, setFlashSaleModalMaxDiscount] = useState(0);
  const [flashSaleModalSecondsLeft, setFlashSaleModalSecondsLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [homeModalVariant, setHomeModalVariant] = useState<
    "flashSale" | "welcome"
  >("flashSale");
  const [welcomeCompanyName, setWelcomeCompanyName] = useState("");
  const router = useRouter();
  const isAuthenticated = Boolean(userSession?.accessToken);

  const pathname = usePathname();
  // const companyId = useMemo(

  const companyId = useMemo(
    () => userSession?.companyId || API_CONFIG.companyId,
    [userSession?.companyId],
  );

  useEffect(() => {
    setImageLoaded(false);
  }, [logoSrc]);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const openHomeModal = async () => {
    if (!companyId) return;
    if (flashSaleModalOpen || flashSaleModalLoading) return;

    setFlashSaleModalLoading(true);
    try {
      const products = await getFlashSaleProducts(companyId).catch(() => []);

      if (products && products.length > 0) {
        const maxDiscount = products.reduce((max, p) => {
          const discount =
            p.flashSellPrice && p.price
              ? Math.round(((p.price - p.flashSellPrice) / p.price) * 100)
              : 0;
          return discount > max ? discount : max;
        }, 0);

        const now = Date.now();
        const validEndTimes = products
          .map((p) =>
            p.flashSellEndTime ? new Date(p.flashSellEndTime).getTime() : null,
          )
          .filter((t): t is number => !!t && t > now);
        const nearestEndTime = validEndTimes.length
          ? Math.min(...validEndTimes)
          : null;
        const initialSecondsLeft =
          nearestEndTime && nearestEndTime > now
            ? Math.max(0, Math.floor((nearestEndTime - now) / 1000))
            : 0;

        setHomeModalVariant("flashSale");
        setFlashSaleModalProducts(products.slice(0, 4));
        setFlashSaleModalTotalCount(products.length);
        setFlashSaleModalMaxDiscount(maxDiscount);
        setFlashSaleModalSecondsLeft(initialSecondsLeft);
        setFlashSaleModalOpen(true);
        return;
      }

      let companyName = welcomeCompanyName;
      if (!companyName) {
        const user = await getSystemUserByCompanyId(companyId).catch(
          () => null,
        );
        companyName = user?.companyName || "";
        if (companyName) setWelcomeCompanyName(companyName);
      }

      setHomeModalVariant("welcome");
      setFlashSaleModalOpen(true);
    } finally {
      setFlashSaleModalLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadLogo = async () => {
      if (!companyId) return;
      try {
        const user = await getSystemUserByCompanyId(companyId);
        if (mounted && user?.companyLogo) {
          setLogoSrc(user.companyLogo);
        }
        if (mounted && user?.companyName) {
          setWelcomeCompanyName(user.companyName);
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

  useEffect(() => {
    if (pathname !== "/") return;
    openHomeModal();
  }, [pathname, companyId]);

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
                onClick={() => {
                  if (pathname === "/") openHomeModal();
                }}
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
            </ul>
          </div>
          <div className=" flex gap-4 items-center  ">
            <div className="">
              <CartDrawer />
            </div>

            <div className="md:block hidden">
              {authLoading ? (
                <div className="h-9 w-20  rounded-[60px] border border-gray-200 bg-gray-50" />
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
              className="
    py-2 pl-2 
    lg:hidden
    md:block
    hidden       
    text-2xl 
    cursor-pointer
  "
            >
              {toggle ? <FaXmark /> : <FaBars />}
            </div>
          </div>
        </div>
      </div>
      {/* small device menu bar  */}

      <div
        className={`bg-white shadow-md absolute backdrop-blur-xl 
          min-[950px]:hidden block  transition-all ease-linear duration-200 border-r border-gray-200 ${cn(
            toggle ? "left-0" : "-left-80",
            toggle && "right-0",
          )}`}
      >
        <ul className=" flex flex-col bg gap-2">
          <Link
            onClick={() => {
              setToggle(!toggle);
              if (pathname === "/") openHomeModal();
            }}
            href="/"
            className=" text-lg font-medium px-5 py-2 hover:text-primary tran95ion-all ease-linear duration-200  hover:bg-primary/5"
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

          {!authLoading && !isAuthenticated && (
            <div className="mt-auto  border-t border-gray-100/70 pt-7 pb-10 px-5 sm:px-6 space-y-4">
              <Link
                onClick={() => setToggle(false)}
                href="/login"
                className={`
        flex items-center justify-center gap-3.5
        w-full py-2.5 px-5
        bg-white text-gray-800 font-medium text-base
        rounded-2xl border border-gray-200/80
        shadow-[0_4px_15px_rgba(0,0,0,0.08)]
        hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)]
        hover:border-gray-300 hover:text-primary
        active:scale-[0.98]
        transition-all duration-300
      `}
              >
                <FiLogIn className="text-2xl text-gray-700" />
                <span>লগইন করুন</span>
              </Link>

              <Link
                onClick={() => setToggle(false)}
                href="/register"
                className={`
        flex items-center justify-center gap-3.5
        w-full py-2.5 px-5
        bg-primary text-white font-medium text-base
        rounded-2xl
        shadow-[0_6px_20px_rgba(var(--primary-rgb),0.25)]
        hover:shadow-[0_10px_30px_rgba(var(--primary-rgb),0.35)]
        hover:bg-primary/95
        active:scale-[0.98]
        transition-all duration-300
      `}
              >
                <FiUserPlus className="text-2xl" />
                <span>রেজিস্টার করুন</span>
              </Link>

              <p className="text-center text-xs text-gray-500 mt-2">
                অ্যাকাউন্ট না থাকলে রেজিস্টার করুন • দ্রুত ও সহজ
              </p>
            </div>
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

      <Modal
        open={flashSaleModalOpen}
        onCancel={() => setFlashSaleModalOpen(false)}
        footer={null}
        centered
        closable={false}
        width={isMobile ? "92vw" : 980}
        styles={{
          content: {
            padding: 0,
            borderRadius: isMobile ? 30 : 24,
            overflow: "hidden",
          },
          body: { padding: 0 },
        }}
        destroyOnClose
      >
        {homeModalVariant === "flashSale" ? (
          <div className="space-y-4 p-4 sm:p-6">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 to-orange-500 text-white">
              <button
                type="button"
                onClick={() => setFlashSaleModalOpen(false)}
                className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30 transition-colors ring-1 ring-white/30"
                aria-label="Close"
              >
                <span className="text-2xl leading-none">×</span>
              </button>

              <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                      LIVE
                    </span>
                    <span className="text-xs sm:text-sm text-white/90 font-medium">
                      আজকের ফ্ল্যাশ সেল শুরু হয়েছে
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    {flashSaleModalMaxDiscount > 0
                      ? `${flashSaleModalMaxDiscount}% পর্যন্ত ছাড়!`
                      : "বিশেষ ছাড় চলছে!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90 font-medium">
                    মোট {flashSaleModalTotalCount}টি পণ্যে অফার চলছে
                  </p>
                </div>
                {flashSaleModalSecondsLeft > 0 && (
                  <div className="rounded-2xl bg-white/15 border border-white/25 px-4 py-4 backdrop-blur">
                    <div className="text-xs font-semibold text-white/90 mb-2">
                      অফার শেষ হতে বাকি
                    </div>
                    <CountDown initialSecondsLeft={flashSaleModalSecondsLeft} />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {flashSaleModalProducts.map((p) => {
                const imgSrc = p.thumbnail || p.images?.[0]?.url;
                const discount =
                  p.flashSellPrice && p.price
                    ? Math.round(((p.price - p.flashSellPrice) / p.price) * 100)
                    : 0;
                const finalPrice =
                  p.flashSellPrice && p.price && p.flashSellPrice < p.price
                    ? p.flashSellPrice
                    : p.price;

                return (
                  <Link
                    key={p.sku || p.id}
                    href={`/flashSell/${p.sku || p.id}`}
                    onClick={() => setFlashSaleModalOpen(false)}
                    className="group block rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative bg-gray-50 overflow-hidden">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={p.name}
                          width={240}
                          height={200}
                          className="aspect-[7/5] w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                        />
                      ) : (
                        <div className="aspect-[7/5] w-full bg-gray-100" />
                      )}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          SAVE {discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-[12px] sm:text-sm font-semibold text-gray-900 line-clamp-2">
                        {p.name}
                      </p>
                      <p className="text-sm font-bold text-primary">
                        ৳ {formatteeNumber(Number(finalPrice || 0))}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setFlashSaleModalOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
              >
                পরে দেখবো
              </button>
              <Link
                href="/flashSell"
                onClick={() => setFlashSaleModalOpen(false)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                সব ফ্ল্যাশ ডিল দেখুন
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white border border-white/10">
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
              <button
                type="button"
                onClick={() => setFlashSaleModalOpen(false)}
                className="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 transition-colors ring-1 ring-white/20"
                aria-label="Close"
              >
                <span className="text-2xl leading-none">×</span>
              </button>

              <div className="relative p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center overflow-hidden">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt="logo"
                            width={44}
                            height={44}
                            unoptimized
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-sm font-bold tracking-wide">
                            {welcomeCompanyName
                              ? welcomeCompanyName.slice(0, 2).toUpperCase()
                              : "HI"}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide">
                        WELCOME
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                      {welcomeCompanyName
                        ? `${welcomeCompanyName} এ স্বাগতম`
                        : "স্বাগতম"}
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 font-medium max-w-[52ch]">
                      ট্রেন্ডিং পণ্য, দ্রুত ডেলিভারি এবং সহজ অর্ডার—সব এক জায়গায়
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/15 p-4 backdrop-blur">
                    <div className="text-xs font-semibold text-white/80">
                      কেন আমাদের থেকে কিনবেন
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-white/80">
                      <div className="flex items-center justify-between gap-3">
                        <span>নিরাপদ পেমেন্ট</span>
                        <span className="text-white/60">•</span>
                        <span>সহজ রিটার্ন</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span>দ্রুত ডেলিভারি</span>
                        <span className="text-white/60">•</span>
                        <span>সাপোর্ট টিম</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-2">
                  <Link
                    href="/products"
                    onClick={() => setFlashSaleModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors"
                  >
                    শপ করুন
                  </Link>
                  <Link
                    href="/contact-us"
                    onClick={() => setFlashSaleModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    সাহায্য লাগবে?
                  </Link>
                  <button
                    onClick={() => setFlashSaleModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-5 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
                  >
                    পরে দেখবো
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </nav>
  );
};

export default Header;
