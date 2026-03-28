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
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
          <div className="relative p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold tracking-wide">
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

            <div className="flex items-center flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs sm:text-sm text-white/80 font-medium">
                দ্রুত কিনুন—স্টক ও সময় দুটোই সীমিত
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
                <Link
                  href="/products"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors"
                >
                  সব পণ্য
                </Link>
                {/* <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  সব পণ্য
                </Link> */}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-base md:text-lg font-bold text-gray-900">
              আজকের ডিল
            </h2>
            <span className="text-xs text-gray-500">
              ({flashSaleProducts.length})
            </span>
          </div>

          <FlashSaleProduct products={flashSaleProducts} layout="grid" />
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-5 md:pt-8 pt-3">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primaryDark text-white">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/15 blur-3xl pointer-events-none" />

          <div className="relative p-5 sm:p-7 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                    LIVE
                  </span>
                  <span className="text-xs sm:text-sm text-white/90 font-medium">
                    সীমিত সময়ের অফার
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  ফ্ল্যাশ সেল
                </h2>
                <p className="text-xs sm:text-sm text-white/90 font-medium">
                  {maxDiscount > 0
                    ? `${maxDiscount}% পর্যন্ত ছাড়`
                    : "বিশেষ ছাড়"}{" "}
                  • {flashSaleProducts.length} টি ডিল
                </p>
              </div>

              {initialSecondsLeft > 0 && (
                <div className="rounded-2xl bg-white/15 border border-white/25 px-4 py-4 backdrop-blur">
                  <div className="text-xs font-semibold text-white/90 mb-2">
                    অফার শেষ হতে বাকি
                  </div>
                  <CountDown initialSecondsLeft={initialSecondsLeft} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:items-center sm:justify-end">
              <Link
                href="/flashSell"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90 transition-colors"
              >
                সব ডিল দেখুন
              </Link>
              <Link
                href="/products"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                সব পণ্য
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/70 p-4 sm:p-6">
          <FlashSaleProduct products={flashSaleProducts} />
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
