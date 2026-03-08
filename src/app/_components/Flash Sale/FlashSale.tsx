import { getFlashSaleProducts, Product } from "../../../lib/api-services";
import CountDown from "./CountDown";
import FlashSaleProduct from "./FlashSaleProduct";
import ScrollAnimation from "../../../components/shared/ScrollAnimation";

const FlashSale = async () => {
  let flashSaleProducts: Product[] = [];

  try {
    flashSaleProducts = await getFlashSaleProducts();
  } catch (error) {
    console.error("Failed to load flash sale products:", error);
    // flashSaleProducts will remain empty array
  }

  // If there are no flash sale products, don't show the section
  if (flashSaleProducts.length === 0) {
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

  return (
    <section className=" max-w-7xl mx-auto px-5 md:pt-10 pt-5 ">
      <ScrollAnimation>
        <div className=" overflow-hidden bg-gradient-to-r from-[#F3F4F6] to-[#E5E7EB] border border-white/50 shadow-lg relative">
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
              <FlashSaleProduct />
            </div>
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
};

export default FlashSale;
