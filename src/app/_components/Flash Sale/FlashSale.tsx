import { getFlashSaleProducts, Product } from "../../../lib/api-services";
import Link from "next/link";
import CountDown from "./CountDown";
import FlashSaleProduct from "./FlashSaleProduct";

interface FlashSaleProps {
  isPage?: boolean;
}

const FlashSale = async ({ isPage = false }: FlashSaleProps = {}) => {
  let flashSaleProducts: Product[] = [];

  try {
    flashSaleProducts = await getFlashSaleProducts();
  } catch (error) {
    console.error("Failed to load flash sale products:", error);
    // flashSaleProducts will remain empty array
  }

  // If there are no flash sale products, don't show the section
  if (flashSaleProducts.length === 0) {
    if (isPage) {
      return (
        <section className="max-w-7xl mx-auto px-5 md:pt-10 pt-5 min-h-[50vh] flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              এই মুহূর্তে কোনো ফ্ল্যাশ সেল চলছে না
            </h2>
            <p className="text-gray-500">
              পরবর্তী ফ্ল্যাশ সেলের চমকপ্রদ ডিল পেতে আমাদের সাথেই থাকুন!
            </p>
          </div>
        </section>
      );
    }
    return null;
  }

  // Calculate maximum discount from flash sale products (real % off)
  const maxDiscount =
    flashSaleProducts.length > 0
      ? flashSaleProducts.reduce((max, p) => {
          const discount =
            p.flashSellPrice && p.price
              ? Math.round(((p.price - p.flashSellPrice) / p.price) * 100)
              : 0;
          return discount > max ? discount : max;
        }, 0)
      : 0;

  // Find the nearest flash sell end time to show in countdown
  const now = Date.now();
  const validEndTimes = flashSaleProducts
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

  if (isPage) {
    return (
      <section className="max-w-7xl mx-auto px-5 md:py-10 py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white border border-white/10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-red-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                    LIVE
                  </span>
                  <span className="text-xs sm:text-sm text-white/80 font-medium">
                    সীমিত সময়ের অফার
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                  ফ্ল্যাশ সেল
                </h1>
                <p className="text-sm sm:text-base text-white/80 font-medium">
                  {maxDiscount > 0
                    ? `${maxDiscount}% পর্যন্ত ছাড়`
                    : "বিশেষ ছাড়"}{" "}
                  • {flashSaleProducts.length} টি পণ্য
                </p>
              </div>
              {initialSecondsLeft > 0 && (
                <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-4 backdrop-blur">
                  <div className="text-xs font-semibold text-white/80 mb-2">
                    শেষ হতে বাকি
                  </div>
                  <CountDown initialSecondsLeft={initialSecondsLeft} />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm text-white/80 font-medium">
                দ্রুত কিনুন—স্টক ও সময় দুটোই সীমিত
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/flashSell/all"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors"
                >
                  সব ডিল দেখুন
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  সব পণ্য
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-gray-900">
                  আজকের ডিল
                </h2>
                <span className="text-xs text-gray-500">
                  ({flashSaleProducts.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">সাজান:</span>
                <select className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-300">
                  <option>ছাড় বেশি</option>
                  <option>দাম কম</option>
                  <option>দাম বেশি</option>
                  <option>নতুন</option>
                </select>
              </div>
            </div>

            <FlashSaleProduct products={flashSaleProducts} layout="grid" />
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900">
                  কেন এখনই কিনবেন
                </h3>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  <p>সীমিত সময়ের অফার—শেষ হলে আগের দামে ফিরে যাবে</p>
                  <p>স্টক সীমিত—জনপ্রিয় পণ্য দ্রুত শেষ হয়ে যায়</p>
                  <p>একাধিক পণ্য একসাথে কিনলে ডেলিভারি সুবিধাজনক</p>
                </div>
                <Link
                  href="/view-cart"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
                >
                  কার্ট দেখুন
                </Link>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5 shadow-sm">
                <h3 className="text-base font-bold text-gray-900">হেল্পলাইন</h3>
                <p className="mt-2 text-sm text-gray-600">
                  অর্ডার বা ডেলিভারি নিয়ে সাহায্য লাগলে আমাদের সাথে যোগাযোগ
                  করুন।
                </p>
                <Link
                  href="/contact-us"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  যোগাযোগ করুন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className=" max-w-7xl mx-auto px-5 md:pt-10 pt-5 ">
      <div className=" overflow-hidden bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB] border border-white/50 shadow-sm rounded-2xl relative">
        {/* Background pattern or decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="relative z-10 sm:p-8 p-5 flex flex-col gap-5">
          <div className="flex justify-between items-center gap-4 flex-col sm:flex-row border-b border-gray-200/60 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded animate-pulse">
                  LIVE
                </span>
                <h2 className="sm:text-3xl text-2xl font-black text-gray-800 tracking-tight">
                  ফ্ল্যাশ সেল
                </h2>
              </div>
              <p className="sm:text-sm text-xs text-gray-600 mt-1 font-medium">
                {`${maxDiscount}% পর্যন্ত ফ্ল্যাশ সেল ডিল উপভোগ করুন!`}
              </p>
            </div>
            <div>
              <CountDown initialSecondsLeft={initialSecondsLeft} />
            </div>
          </div>
          <div>
            <FlashSaleProduct products={flashSaleProducts} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
