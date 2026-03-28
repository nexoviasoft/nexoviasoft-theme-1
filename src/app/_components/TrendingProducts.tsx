import { getTrendingProducts, Product } from "../../lib/api-services";
import { API_CONFIG } from "../../lib/api-config";
import TrendingProductsList from "./TrendingProductsList";

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
      <h1 className=" sm:text-2xl text-xl font-bold text-primary">
        ট্রেন্ডিং পণ্য
      </h1>
      <div>
        <TrendingProductsList products={list} />
      </div>
    </section>
  );
};

export default TrendingProducts;
