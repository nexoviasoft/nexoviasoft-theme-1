"use client";

import ProductCard from "../../../../components/ui/ProductCard";
import PaginationProducts from "./PaginationProducts";
import { getProducts, Product } from "../../../../lib/api-services";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { API_CONFIG } from "../../../../lib/api-config";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } },
};

interface ImageProps {
  name: string;
  url: string;
}
interface ReviewProps {
  rating: number;
}
interface VariantProps {
  price: number;
  size: string;
  available_quantity: number;
  stock_status: string;
}
interface ProductProps {
  SKU: string;
  documentId: string;
  off: number;
  title: string;
  images: ImageProps[];
  reviews: ReviewProps[];
  variant: VariantProps[];
  categoryName?: string;
  availabilityStatus?: string;
  createdAt?: string | Date;
  description?: string;
  shortDescription?: string;
  price?: number;
  discountPrice?: number;
}

// Helper function to map REST API product to component format
function mapProductToCardFormat(apiProduct: Product): ProductProps {
  const off = apiProduct.discountPrice && apiProduct.price
    ? Math.round(((apiProduct.price - apiProduct.discountPrice) / apiProduct.price) * 100)
    : 0;

  const images: ImageProps[] = apiProduct.images?.map((img, index) => ({
    name: img.alt || `Image ${index + 1}`,
    url: img.url,
  })) || [];

  const variant: VariantProps[] = [{
    price: Number(apiProduct.price),
    size: "Default",
    available_quantity: 100, // Default value - would need to come from inventory if available
    stock_status: apiProduct.isActive ? "in_stock" : "out_of_stock",
  }];

  // Map to high-level availability tags used by filters
  let availabilityStatus: string = apiProduct.isActive ? "in-stock" : "out-of-stock";
  // Treat upcoming flash-sell products with future start time as "upcoming" if data available
  if (
    apiProduct.isFlashSell &&
    apiProduct.flashSellStartTime &&
    new Date(apiProduct.flashSellStartTime) > new Date()
  ) {
    availabilityStatus = "upcoming";
  }

  return {
    SKU: apiProduct.sku,
    documentId: apiProduct.id.toString(),
    off,
    title: apiProduct.name,
    images,
    reviews: [],
    variant,
    categoryName: apiProduct.category?.name,
    availabilityStatus,
    createdAt: apiProduct.createdAt,
    description: apiProduct.description,
    shortDescription: apiProduct.description,
    price: Number(apiProduct.price),
    discountPrice: apiProduct.discountPrice ? Number(apiProduct.discountPrice) : 0,
  };
}

const ProductsBody = () => {
  const { userSession } = useAuth();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search");
  const categoriesParam = searchParams.get("categories") || "";
  const availabilityParam = searchParams.get("availability") || "";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  const sortParam = searchParams.get("sort") || "";
  const [products, setProducts] = useState<ProductProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const companyId = useMemo(
    () => userSession?.companyId || API_CONFIG.companyId,
    [userSession?.companyId],
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // সব প্রোডাক্ট backend থেকে আনব
        const apiProducts: Product[] = await getProducts(companyId);
        const mappedProducts = apiProducts.map(mapProductToCardFormat);

        // Normalized search text
        const normalizedSearch = searchTerm
          ? searchTerm.toLowerCase()
          : "";

        // Selected categories (multi-select supported)
        const selectedCategories = categoriesParam
          ? categoriesParam.split(",").filter(Boolean)
          : [];

        // Selected availability tags
        const selectedAvailability = availabilityParam
          ? availabilityParam.split(",").filter(Boolean)
          : [];

        // Price range (only apply when both params are present and valid)
        const hasPriceFilter =
          minPriceParam !== null &&
          maxPriceParam !== null &&
          !Number.isNaN(Number(minPriceParam)) &&
          !Number.isNaN(Number(maxPriceParam));

        const minPrice = hasPriceFilter ? Number(minPriceParam) : 0;
        const maxPrice = hasPriceFilter
          ? Number(maxPriceParam)
          : Number.MAX_SAFE_INTEGER;

        const filteredProducts = mappedProducts.filter((p) => {
          const matchesCategory = selectedCategories.length
            ? p.categoryName && selectedCategories.includes(p.categoryName)
            : true;

          const matchesSearch = normalizedSearch
            ? p.title.toLowerCase().includes(normalizedSearch) ||
              p.SKU.toLowerCase().includes(normalizedSearch)
            : true;

          const basePrice = p.variant?.[0]?.price ?? 0;
          const matchesPrice = hasPriceFilter
            ? basePrice >= minPrice && basePrice <= maxPrice
            : true;

          const productAvailability = p.availabilityStatus || "in-stock";
          const matchesAvailability = selectedAvailability.length
            ? selectedAvailability.includes(productAvailability)
            : true;

          return (
            matchesCategory &&
            matchesSearch &&
            matchesPrice &&
            matchesAvailability
          );
        });

        // Apply sorting
        const sortedProducts = [...filteredProducts];
        switch (sortParam) {
          case "Sort by price: low to high":
            sortedProducts.sort(
              (a, b) =>
                (a.variant?.[0]?.price ?? 0) -
                (b.variant?.[0]?.price ?? 0),
            );
            break;
          case "Sort by price: high to low":
            sortedProducts.sort(
              (a, b) =>
                (b.variant?.[0]?.price ?? 0) -
                (a.variant?.[0]?.price ?? 0),
            );
            break;
          case "Sort by latest":
            sortedProducts.sort((a, b) => {
              const aTime = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
              const bTime = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;
              return bTime - aTime;
            });
            break;
          // For popularity / rating we currently have no data,
          // so we keep the original backend order.
          default:
            break;
        }

        setProducts(sortedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err instanceof Error ? err.message : "Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    searchTerm,
    categoriesParam,
    availabilityParam,
    minPriceParam,
    maxPriceParam,
    sortParam,
    companyId,
  ]);

  if (loading) {
    return (
      <section className="w-full flex justify-center items-center py-16">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 border border-gray-200">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            <span className="text-[11px] font-medium text-gray-700">
              আপনার জন্য পণ্যগুলো লোড হচ্ছে
            </span>
          </div>
          <div className="space-y-2 animate-pulse">
            <div className="mx-auto h-3 w-40 rounded-full bg-gray-200" />
            <div className="mx-auto h-3 w-64 rounded-full bg-gray-100" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full flex justify-center items-center py-16">
        <div className="max-w-md w-full text-center space-y-3 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-6">
          <p className="text-sm font-semibold text-gray-800">কিছু ভুল হয়েছে</p>
          <p className="text-sm text-gray-700 break-words">
            {error}
          </p>
          <p className="text-xs text-gray-600">
            অনুগ্রহ করে পেজটি রিফ্রেশ করুন। যদি সমস্যা ঠিক না হয়, কিছুক্ষণ পরে আবার চেষ্টা করুন।
          </p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="w-full flex justify-center items-center py-20">
        <div className="max-w-lg w-full text-center space-y-4 rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-8">
          <p className="text-sm font-semibold text-gray-900">
            আপনার নির্বাচিত ফিল্টারে কোনো পণ্য পাওয়া যায়নি
          </p>
          <p className="text-sm text-gray-500">
            আরো পণ্য দেখতে কিছু ফিল্টার সরিয়ে ফেলুন অথবা দাম ও ক্যাটাগরি পরিবর্তন করে চেষ্টা করুন।
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col gap-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid w-full grid-cols-[repeat(auto-fit,_minmax(160px,_1fr))] sm:grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))] gap-4 sm:gap-5 lg:gap-6"
      >
        {products.map((product) => (
          <motion.div
            key={product.SKU || product.documentId}
            variants={itemVariants}
            className="h-full"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>

      <div className="w-full flex justify-center">
        <PaginationProducts total={products.length} />
      </div>
    </section>
  );
};

export default ProductsBody;
