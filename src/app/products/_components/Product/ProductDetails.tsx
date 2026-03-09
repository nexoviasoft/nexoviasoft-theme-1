"use client";
import formatteeNumber from "../../../../utils/formatteNumber";
import { calculateAverageRating } from "../../../../utils/getAverageRating";
import { Rate } from "antd";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FaRegClock, FaTruckFast } from "react-icons/fa6";
import { GoArrowUpRight, GoShareAndroid } from "react-icons/go";
import {
  RiMastercardFill,
  RiShieldCheckFill,
  RiVisaLine,
} from "react-icons/ri";
import { TbCurrencyTaka, TbTruckReturn } from "react-icons/tb";
import ProductCart from "./ProductCart";
import Variant from "./Variant";
import { Review } from "../../../../types/review";
import {
  PromoCode,
  getSystemUserByCompanyId,
} from "../../../../lib/api-services";
import { API_CONFIG } from "../../../../lib/api-config";

interface CategoryProps {
  name: string;
  slug: string;
}
interface List {
  id: string;
  item: string;
}

interface ListItems {
  id: string;
  title: string;
  list: List[];
}
interface DescriptionProps {
  id: string;
  summary: string;
  list_items: ListItems[];
}
interface ImageProps {
  name: string;
  url: string;
}
interface VariantProps {
  available_quantity: number;
  id: string;
  price: number;
  size: string;
  stock_status: string;
}
interface ProductProps {
  product: {
    id?: number;
    companyId?: string;
    SKU: string;
    documentId: string;
    off: number;
    price: number;
    discountPrice?: number;
    title: string;
    total_sale: number;
    categories: CategoryProps[];
    description: DescriptionProps;
    images: ImageProps[];
    reviews: Review[];
    variant: VariantProps[];
  };
  promos?: PromoCode[];
}

const ProductDetails: React.FC<ProductProps> = ({ product, promos }) => {
  const [price, setPrice] = useState(
    Number(product?.price ?? product?.variant[0]?.price ?? 0),
  );


  console.log("ProductProps", product);

  const handlePrice = (variantPrice: number = 0) => {
    setPrice(variantPrice);
  };

  const [quantity, setQuantity] = useState(1);

  const originalPrice = Number(price || 0);
  const discountedPrice = Number(product?.discountPrice || 0);

  const getFinalPrice = () => {
    if (
      originalPrice > 0 &&
      discountedPrice > 0 &&
      discountedPrice < originalPrice
    ) {
      return discountedPrice;
    }
    if (product?.off && product.off > 0 && originalPrice > 0) {
      return Math.round(originalPrice - (originalPrice * product.off) / 100);
    }
    return originalPrice;
  };

  const hasDiscount =
    (discountedPrice > 0 && discountedPrice < originalPrice) ||
    (Number(product?.off || 0) > 0 && originalPrice > 0);
  const applicablePromos = promos ?? [];

  const [shareUrl, setShareUrl] = useState<string>("");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);

  const companyId = useMemo(
    () => product?.companyId || API_CONFIG.companyId,
    [product?.companyId],
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadOwner = async () => {
      try {
        if (!companyId) return;
        const user = await getSystemUserByCompanyId(companyId);
        if (mounted) {
          setOwnerPhone(user?.phone ?? null);
        }
      } catch (error) {
        // console.error("Failed to load system user for product details:", error);
      }
    };
    loadOwner();
    return () => {
      mounted = false;
    };
  }, [companyId]);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl,
  )}`;

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${product?.title} - ${shareUrl}`,
  )}`;

  const whatsappQuestionUrl = ownerPhone
    ? `https://wa.me/${encodeURIComponent(
        ownerPhone.replace(/[^0-9]/g, ""),
      )}?text=${encodeURIComponent(
        `প্রিয় স্যার, এই পণ্যটি সম্পর্কে কিছু জানতে চাই: ${product?.title} - ${shareUrl}`,
      )}`
    : null;

  /*
  // ============================================
  // 📋 CONSOLE LOGS - SECTION WISE DATA
  // ============================================

  console.group("🛍️ === PRODUCT DETAILS PAGE DATA ===");

  // Section 1: Basic Product Information
  console.group("📦 BASIC PRODUCT INFO");
  console.log("Product ID:", product?.id);
  console.log("Document ID:", product?.documentId);
  console.log("Company ID:", product?.companyId);
  console.log("SKU:", product?.SKU);
  console.log("Title:", product?.title);
  console.log("Total Sales:", product?.total_sale);
  console.groupEnd();

  // Section 2: Categories
  console.group("🏷️ CATEGORIES");
  console.log("Categories Count:", product?.categories?.length || 0);
  console.table(product?.categories);
  console.groupEnd();

  // Section 3: Pricing Information
  console.group("💰 PRICING DETAILS");
  console.log("Base Price:", product?.price);
  console.log("Discount Price:", product?.discountPrice);
  console.log("Discount Percentage:", product?.off + "%");
  console.log("Current Selected Price:", price);
  console.log("Original Price:", originalPrice);
  console.log("Final Price:", getFinalPrice());
  console.log("Has Discount:", hasDiscount);
  console.groupEnd();

  // Section 4: Variants
  console.group("📏 PRODUCT VARIANTS");
  console.log("Variants Count:", product?.variant?.length || 0);
  console.table(product?.variant);
  product?.variant?.forEach((variant, index) => {
    console.log(`Variant ${index + 1}:`, {
      id: variant.id,
      size: variant.size,
      price: variant.price,
      stock: variant.available_quantity,
      status: variant.stock_status,
    });
  });
  console.groupEnd();

  // Section 5: Images
  console.group("🖼️ PRODUCT IMAGES");
  console.log("Images Count:", product?.images?.length || 0);
  console.table(product?.images);
  product?.images?.forEach((image, index) => {
    console.log(`Image ${index + 1}:`, image.url);
  });
  console.groupEnd();

  // Section 6: Reviews & Ratings
  console.group("⭐ REVIEWS & RATINGS");
  console.log("Total Reviews:", product?.reviews?.length || 0);
  console.log("Average Rating:", calculateAverageRating(product?.reviews));
  console.table(product?.reviews);
  console.groupEnd();

  // Section 7: Description & Features
  console.group("📝 DESCRIPTION");
  console.log("Summary:", product?.description?.summary);
  console.log("List Items:", product?.description?.list_items);
  product?.description?.list_items?.forEach((item, index) => {
    console.group(`Feature ${index + 1}: ${item.title}`);
    console.table(item.list);
    console.groupEnd();
  });
  console.groupEnd();

  // Section 8: Complete Product Object
  console.group("🔍 COMPLETE PRODUCT OBJECT");
  console.log("Full Product Data:", product);
  console.groupEnd();

  console.groupEnd(); // End of Product Details Page Data
  */

  return (
    <section className="flex flex-col gap-4 md:gap-5">
      {/* product category and review amounts start  */}
      <div className="flex flex-wrap items-center gap-3 min-[400px]:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-gray-500">
            ক্যাটাগরি
          </span>
          <div className="flex flex-wrap gap-1">
            {product?.categories?.map((category, index) => (
              <span
                key={category?.slug}
                className="rounded-full bg-gray-100 px-2 py-[2px] text-[11px] font-medium text-primary"
              >
                {category?.name}
                {index < product.categories.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
        <div className="h-4 w-px bg-gray-200 hidden sm:block" />
        <div className="flex gap-1.5 items-center">
          <Rate
            disabled
            allowHalf
            defaultValue={calculateAverageRating(product?.reviews)}
          />
          <p className="text-xs sm:text-sm text-gray-600">
            ({product?.reviews.length} টি রিভিউ)
          </p>
        </div>
      </div>
      {/* product category and review amounts end  */}

      {/* title & stock info start */}
      <h1 className="text-lg sm:text-2xl md:text-3xl font-semibold text-gray-900 leading-snug">
        {product?.title}
      </h1>
      {/* title & stock info end */}

      {/* product  variant start */}
      <div className="pt-1 border-t border-gray-200">
        <Variant variant={product?.variant} handlePrice={handlePrice} />
      </div>
      {/* product variant end */}

      {/* product price info start */}
      <div className="flex items-end gap-3">
        <div className="flex items-center text-primary">
          <span className="text-3xl sm:text-4xl">
            <TbCurrencyTaka />
          </span>
          <h2 className="mt-[2px] sm:text-4xl text-2xl font-bold">
            {formatteeNumber(getFinalPrice())}
          </h2>
        </div>
        {hasDiscount && (
          <div className="flex flex-col gap-0.5 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <TbCurrencyTaka size={14} />
              <span className="line-through">
                {formatteeNumber(originalPrice)}
              </span>
            </div>
            <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-[1px] text-[11px] font-medium text-gray-700">
              {product?.off}% OFF
            </span>
          </div>
        )}
      </div>
      {/* product price info end */}

      {/* product specific promo codes start */}
      {applicablePromos.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-xs sm:text-sm text-gray-700">
            এই প্রোডাক্টের জন্য উপলব্ধ কুপন কোড:
          </p>
          <div className="flex flex-wrap gap-2">
            {applicablePromos.map((promo) => (
              <Link
                key={promo.id}
                href={`/checkout?productId=${encodeURIComponent(
                  String(product?.documentId || product?.id),
                )}&companyId=${encodeURIComponent(
                  product?.companyId || "",
                )}&promoCode=${encodeURIComponent(
                  promo.code,
                )}&quantity=${encodeURIComponent(String(quantity))}`}
                className="text-xs px-3 py-1 rounded-full border bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary hover:text-white transition-colors"
              >
                <span className="font-semibold">{promo.code}</span>
                <span className="ml-1 text-[11px] text-gray-600">
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}% ছাড়`
                    : `${promo.discountValue}৳ ছাড়`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* product specific promo codes end */}

      {/* cart & buy now button start */}
      <div className="flex min-[1035px]:flex-row md:flex-col min-[500px]:flex-row flex-col gap-3">
        <div>
          <ProductCart
            price={getFinalPrice()}
            productId={Number(product?.documentId || product?.id)}
            quantity={quantity}
            onChangeQuantity={setQuantity}
          />
        </div>
        <Link
          className="flex-1 flex items-center justify-center gap-1 px-4 py-2 sm:text-base text-sm hover:bg-black bg-primary text-white transition-all ease-linear duration-200 rounded-3xl overflow-hidden"
          href={`/checkout?productId=${encodeURIComponent(
            String(product?.documentId || product?.id),
          )}&companyId=${encodeURIComponent(
            product?.companyId || "",
          )}&quantity=${encodeURIComponent(String(quantity))}`}
        >
          <span>এখনই কিনুন</span>
          <GoArrowUpRight className="sm:text-2xl text-xl" />
        </Link>
      </div>
      {/* cart & buy now button end */}

      <div className="flex gap-4 flex-wrap items-center text-sm sm:text-base">
        <button
          type="button"
          className=" flex items-center gap-1 hover:text-primary transition-all disabled:opacity-60"
          disabled={!whatsappQuestionUrl}
          onClick={() => {
            if (!whatsappQuestionUrl) return;
            window.open(whatsappQuestionUrl, "_blank", "noopener,noreferrer");
          }}
        >
          <FaRegQuestionCircle /> <span>প্রশ্ন করুন</span>
        </button>
        <Link
          href="/refund-and-return-policy"
          className=" flex items-center gap-1 hover:text-primary transition-all"
        >
          <FaTruckFast /> <span>ডেলিভারি ও রিটার্ন</span>
        </Link>
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 hover:text-primary transition-all"
            onClick={() => setIsShareOpen((prev) => !prev)}
          >
            <GoShareAndroid />
            <span> শেয়ার করুন</span>
          </button>
          {isShareOpen && (
            <div className="absolute z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg p-2 flex flex-col gap-1">
              <button
                type="button"
                className="w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100"
                onClick={() => {
                  window.open(
                    facebookShareUrl,
                    "_blank",
                    "noopener,noreferrer",
                  );
                  setIsShareOpen(false);
                }}
              >
                Facebook এ শেয়ার করুন
              </button>
              <button
                type="button"
                className="w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100"
                onClick={() => {
                  window.open(
                    whatsappShareUrl,
                    "_blank",
                    "noopener,noreferrer",
                  );
                  setIsShareOpen(false);
                }}
              >
                WhatsApp এ শেয়ার করুন
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid min-[820px]:grid-cols-2 md:grid-cols-1 min-[500px]:grid-cols-2 grid-cols-1 grid-rows-2 min-[500px]:grid-rows-1 md:grid-rows-2 min-[820px]:grid-rows-1 gap-3 text-sm sm:text-base">
        <div className="flex flex-col items-center justify-center text-center border border-gray-200 bg-gray-50 px-5 py-3 rounded-xl w-full">
          <div>
            <FaRegClock size={20} />
          </div>
          <p>
            আনুমানিক ডেলিভারি সময়:
            <strong> ২-৩ দিন</strong>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center text-center border border-gray-200 bg-gray-50 px-5 py-3 rounded-xl">
          <div>
            <TbTruckReturn size={23} />
          </div>
          <p>
            পণ্য কেনার পর <strong>২০ দিনের</strong> মধ্যে রিটার্ন করা যাবে।
            শুল্ক ও ট্যাক্স ফিরতযোগ্য নয়।
          </p>
        </div>
      </div>
      <div className="flex items-center flex-wrap gap-5">
        <div className="flex items-center gap-1">
          <div className="text-lg sm:text-xl text-gray-600">
            <RiShieldCheckFill />
          </div>
          <p className="text-sm sm:text-base">নিরাপদ পেমেন্টের নিশ্চয়তা</p>
        </div>
        <div className="flex gap-3">
          <div className="text-3xl bg-gray-100 px-3 text-gray-800 rounded-lg">
            <RiVisaLine />
          </div>
          <div className="text-3xl bg-gray-100 px-3 text-gray-700 rounded-lg">
            <RiMastercardFill />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetails;
