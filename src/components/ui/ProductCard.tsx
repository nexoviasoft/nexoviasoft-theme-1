"use client";

import { useCart } from "../../context/CartContext";

import { useAuth } from "../../context/AuthContext";

import formatteeNumber from "../../utils/formatteNumber";

import Image from "next/image";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import React from "react";

import toast from "react-hot-toast";

import { IoCartOutline } from "react-icons/io5";

import { TbCurrencyTaka } from "react-icons/tb";

interface Image {
  name: string;

  url: string;
}

interface Review {
  rating?: number; // Optional because the reviews array may be empty
}

interface Variant {
  price: number;

  size: string;

  available_quantity: number;

  stock_status: string;
}

interface ProductProps {
  id?: number;

  name?: string;

  title?: string;

  documentId?: string;

  off?: number;

  SKU?: string;

  sku?: string;

  price?: number | string;

  discountPrice?: number | string;

  thumbnail?: string;

  description?: string;

  shortDescription?: string;

  reviews?: Review[]; // Array of reviews

  images?: Image[]; // Array of images

  variant?: Variant[]; // Array of price variants
}

const ProductCard = ({ product }: { product: ProductProps }) => {
  const { addCartItem } = useCart();

  const { userSession } = useAuth();

  const router = useRouter();

  const pathname = usePathname();

  const getNumericProductId = () => {
    if (typeof product?.id === "number") return product.id;

    if (product?.documentId) {
      const parsed = Number(product.documentId);

      if (!Number.isNaN(parsed)) return parsed;
    }

    return undefined;
  };

  const getProductSlug = () => {
    // For detail route we want a stable slug/SKU

    if (product?.sku) return product.sku;

    if (product?.SKU) return product.SKU;

    if (product?.documentId) return product.documentId;

    if (typeof product?.id === "number") return String(product.id);

    return undefined;
  };

  // Calculate discount percentage from price and discountPrice

  const calculateDiscountPercentage = () => {
    const originalPrice = Number(
      product?.price || product?.variant?.[0]?.price || 0,
    );

    const discountedPrice = Number(product?.discountPrice || 0);

    if (
      originalPrice > 0 &&
      discountedPrice > 0 &&
      discountedPrice < originalPrice
    ) {
      return Math.round(
        ((originalPrice - discountedPrice) / originalPrice) * 100,
      );
    }

    // Fallback to off if provided

    return product?.off || 0;
  };

  // Get the final price to display (discountPrice if available, otherwise original price)

  const getFinalPrice = () => {
    const discountedPrice = Number(product?.discountPrice || 0);

    const originalPrice = Number(
      product?.price || product?.variant?.[0]?.price || 0,
    );

    // If discountPrice exists and is valid, use it
    if (discountedPrice > 0 && discountedPrice < originalPrice) {
      return discountedPrice;
    }

    // If off percentage exists but no discountPrice, calculate it
    if (product?.off && product.off > 0 && originalPrice > 0) {
      return Math.round(originalPrice - (originalPrice * product.off) / 100);
    }

    return originalPrice;
  };

  // Get the original price for strikethrough

  const getOriginalPrice = () => {
    const originalPrice = Number(
      product?.price || product?.variant?.[0]?.price || 0,
    );

    const discountedPrice = Number(product?.discountPrice || 0);

    // Show strikethrough if there's a valid discountPrice
    if (discountedPrice > 0 && discountedPrice < originalPrice) {
      return originalPrice;
    }

    // Show strikethrough if there's an off percentage
    if (product?.off && product.off > 0 && originalPrice > 0) {
      return originalPrice;
    }

    return 0; // Don't show strikethrough if no discount
  };

  const available_variant =
    product?.variant?.filter((i) => i.available_quantity > 0) || [];

  const handleAddProduct = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    event.preventDefault();

    if (!userSession?.accessToken || !userSession?.userId) {
      toast("Please login to add items to cart", { icon: "🔒" });

      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);

      return;
    }

    const productId = getNumericProductId();

    if (!productId) {
      toast.error("Product ID not found");

      return;
    }

    if (available_variant && available_variant.length > 0) {
      try {
        await addCartItem(Number(productId), 1);

        toast.success("Product added to cart!");
      } catch {
        toast.error("Failed to add product to cart");
      }
    } else if (product?.price !== undefined) {
      // If no variant but product has price, allow adding

      try {
        await addCartItem(Number(productId), 1);

        toast.success("Product added to cart!");
      } catch {
        toast.error("Failed to add product to cart");
      }
    } else {
      toast.error("Product is out of stock!");
    }
  };

  const handleBuyNow = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    event.preventDefault();

    const slug = getProductSlug();

    if (!slug) {
      toast.error("Product ID not available");

      return;
    }

    router.push(`/products/${slug}`);
  };

  const imgSrc =
    (product?.thumbnail && product.thumbnail.trim()) ||
    product?.images?.[0]?.url;

  const productDescription =
    product?.shortDescription || product?.description || "";

  return (
    <Link
      href={getProductSlug() ? `/products/${getProductSlug()}` : "#"}
      className="group/product rounded-lg relative flex h-full min-h-[280px]  md:min-h-[320px] w-full flex-col overflow-hidden border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Image */}

      <div className="relative overflow-hidden bg-gray-50">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={product?.name || product?.title || "Product"}
            width={500}
            height={500}
            className="aspect-[7/5] w-full object-cover transition-transform duration-300 ease-out group-hover/product:scale-[1.10]"
          />
        ) : (
          <div
            className="aspect-[7/5] bg-gray-200 flex items-center justify-center text-gray-400 text-sm"
            aria-hidden
          >
            No image
          </div>
        )}

        {calculateDiscountPercentage() > 0 && (
          <div className="absolute top-3 left-3 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
            SAVE {calculateDiscountPercentage()}%
          </div>
        )}

        <button
          onClick={handleAddProduct}
          className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 btn-circle border border-gray-100 bg-white text-gray-700 shadow-sm transition-all duration-200 opacity-100 translate-y-0 md:opacity-0 md:translate-y-1 md:group-hover/product:opacity-100 md:group-hover/product:translate-y-0 hover:bg-primary hover:text-white"
        >
          <IoCartOutline size={18} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-3.5 pb-3.5 pt-3">
        <h2 className="text-sm sm:text-[15px] font-semibold text-gray-900 line-clamp-2">
          {product?.title || product?.name}
        </h2>

        {productDescription && (
          <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2">
            {productDescription}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-1 sm:gap-1.5">
          <div className="flex flex-col leading-none">
            {getOriginalPrice() > 0 && (
              <div className="flex items-center gap-0.5 text-[11px] sm:text-[12px] text-red-500">
                <TbCurrencyTaka size={13} />

                <span className="line-through">
                  {formatteeNumber(getOriginalPrice())}
                </span>
              </div>
            )}

            <div className="flex  justify-center items-center   text-primary">
              <span className="text-[18px] sm:text-[22px] md:text-[24px] leading-none translate-y-[1px]">
                <TbCurrencyTaka />
              </span>

              <span className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                {formatteeNumber(getFinalPrice())}
              </span>
            </div>
          </div>

          <button
            onClick={handleBuyNow}
            className="inline-flex items-center justify-center btn-circle shrink-0 whitespace-nowrap bg-primary px-2.5 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-xs font-medium text-white shadow-sm transition-colors duration-200 hover:bg-gray-800"
          >
            <span>এখনই কিনুন</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
