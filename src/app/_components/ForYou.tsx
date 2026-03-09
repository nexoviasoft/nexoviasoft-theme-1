import { getProducts, Product } from "../../lib/api-services";
import Link from "next/link";
import ForYouGrid from "./ForYouGrid";

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
    <section className="max-w-7xl mx-auto px-5 overflow-hidden md:pt-10 pt-5">
      <div className=" md:mb-5 mb-3 flex items-center justify-between gap-5">
        <h1 className=" sm:text-2xl text-xl font-bold text-primary">
          আমাদের কালেকশন
        </h1>
        <Link
          href={"/products"}
          className=" text-primary underline underline-offset-4 hover:text-gray-700 cursor-pointer transition-all font-medium"
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
