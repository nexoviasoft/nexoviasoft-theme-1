import { getTrendingProducts, Product } from "../../lib/api-services";
import { API_CONFIG } from "../../lib/api-config";
import TrendingProductsList from "./TrendingProductsList";
import { FiTrendingUp } from "react-icons/fi";

const TrendingProducts = async () => {
  const products: Product[] = await getTrendingProducts(
    30,
    10,
    API_CONFIG.companyId,
  ).catch(() => []);
  const list = products ?? [];

  if (list.length === 0) {
    return null;
  }

  return (
    <section className=" max-w-7xl mx-auto px-5 md:pt-8 pt-3 ">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/5 ring-1 ring-primary/10 text-primary flex items-center justify-center">
            <FiTrendingUp className="text-xl" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-gray-900">
              ট্রেন্ডিং পণ্য
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              এই মুহূর্তে যেগুলো বেশি জনপ্রিয়
            </p>
          </div>
        </div>
      </div>
      <div>
        <TrendingProductsList products={list} />
      </div>
    </section>
  );
};

export default TrendingProducts;
