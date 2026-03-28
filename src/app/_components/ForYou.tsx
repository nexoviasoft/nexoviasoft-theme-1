import { getProducts, Product } from "../../lib/api-services";
import Link from "next/link";
import ForYouGrid from "./ForYouGrid";
import { FiShoppingBag } from "react-icons/fi";

const ForYou = async () => {
  let products: Product[] = [];

  try {
    products = await getProducts();
    // Limit to 10 products
    products = products.slice(0, 10);
  } catch (error) {
    console.error("Failed to load products:", error);
    // products will remain empty array
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-5 overflow-hidden md:pt-8 pt-3">
      <div className=" md:mb-5 mb-3 flex items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/5 ring-1 ring-primary/10 text-primary flex items-center justify-center">
            <FiShoppingBag className="text-xl" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-gray-900">
              আমাদের কালেকশন
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              আপনার জন্য বাছাই করা নতুন পণ্য
            </p>
          </div>
        </div>
        <Link
          href={"/products"}
          className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          সব পণ্য দেখুন
        </Link>
      </div>

      <ForYouGrid products={products} />

      <div className="flex items-center justify-center">
        <Link
          href={"/products"}
          className="mt-5 text-center bg-primary hover:bg-gray-800 max-w-max text-white px-10 py-1.5 rounded cursor-pointer"
        >
          আরও দেখুন
        </Link>
      </div>
    </section>
  );
};

export default ForYou;
