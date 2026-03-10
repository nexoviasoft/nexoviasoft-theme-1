import {
  getFlashSaleProducts,
  getProductReviews,
  getRefundPolicies,
  getPublicPromocodes,
  type Product,
  type PromoCode,
} from "../../../lib/api-services";
import { API_CONFIG } from "../../../lib/api-config";
import { Suspense } from "react";
import BreadCrumb from "../../products/_components/Product/Breadcrumb";
import ImageGallery from "../../products/_components/Product/ImageGallery";
import ProductDetails from "../../products/_components/Product/ProductDetails";
import RelatedProducts from "../../products/_components/Product/RelatedProducts";
import Tab from "../../products/_components/Product/Tabs";
import { notFound } from "next/navigation";
import { Review } from "../../../types/review";
import { ReturnPolicy } from "../../../types/return-policy";

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
  id?: number;
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
  companyId?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapProductToComponentFormat(
  apiProduct: Product,
  reviews: Review[],
  companyId: string,
): ProductProps {
  const numericPrice =
    typeof (apiProduct as any).price === "string"
      ? Number((apiProduct as any).price)
      : Number(apiProduct.price);

  const flashPrice =
    (apiProduct as any).flashSellPrice != null
      ? Number((apiProduct as any).flashSellPrice)
      : undefined;

  const numericDiscount =
    (apiProduct as any).discountPrice != null
      ? Number((apiProduct as any).discountPrice)
      : undefined;

  const effectiveDiscountPrice =
    flashPrice != null
      ? flashPrice
      : numericDiscount != null
      ? numericDiscount
      : numericPrice;

  const off =
    effectiveDiscountPrice &&
    numericPrice &&
    effectiveDiscountPrice < numericPrice
      ? Math.round(
          ((numericPrice - effectiveDiscountPrice) / numericPrice) * 100,
        )
      : 0;

  const images: ImageProps[] =
    apiProduct.images?.map(
      (img: { url: string; alt?: string }, index: number) => ({
        name: img.alt || `Image ${index + 1}`,
        url:
          typeof img.url === "string"
            ? img.url.replace(/`/g, "").trim()
            : String(img.url),
      }),
    ) || [];

  const variant: VariantProps[] = [
    {
      id: apiProduct.id.toString(),
      price: numericPrice,
      size: "Default",
      available_quantity:
        (apiProduct as any).stock != null
          ? Number((apiProduct as any).stock)
          : 0,
      stock_status:
        apiProduct.isActive &&
        ((apiProduct as any).stock != null
          ? Number((apiProduct as any).stock)
          : 0) > 0
          ? "in_stock"
          : "out_of_stock",
    },
  ];

  const categories: CategoryProps[] = apiProduct.category
    ? [
        {
          name: apiProduct.category.name,
          slug: apiProduct.category.slug,
        },
      ]
    : [];

  const description: DescriptionProps = {
    id: apiProduct.id.toString(),
    summary: apiProduct.description || "",
    list_items: [],
  };

  return {
    id: apiProduct.id,
    SKU: apiProduct.sku,
    documentId: apiProduct.id.toString(),
    off,
    price: numericPrice,
    discountPrice:
      flashPrice != null
        ? flashPrice
        : numericDiscount != null
        ? numericDiscount
        : undefined,
    title: apiProduct.name,
    total_sale: 0,
    categories,
    description,
    images,
    reviews,
    variant,
    companyId,
  };
}

const FlashSellProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  let product: ProductProps;
  let returnPolicyContent = "";
  let promos: PromoCode[] = [];

  try {
    const companyId = API_CONFIG.companyId;
    const flashProducts = await getFlashSaleProducts(companyId);

    const matched = flashProducts.find(
      (p) =>
        p.sku === slug ||
        String(p.id) === slug ||
        (p.name ? slugify(p.name) === slug : false),
    );

    if (!matched) {
      notFound();
    }

    const [apiReviews, returnPolicies, publicPromos] = await Promise.all([
      getProductReviews(matched!.id, companyId),
      getRefundPolicies(companyId),
      getPublicPromocodes(companyId),
    ]);

    const mappedReviews: Review[] = apiReviews.map((review) => ({
      id: review.id,
      productId: review.productId ?? matched!.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      companyId: review.companyId ?? companyId,
      createdAt: review.createdAt,
      userName: review.userName ?? "Customer",
    }));

    product = mapProductToComponentFormat(matched!, mappedReviews, companyId);

    const now = new Date();
    const activePromos = publicPromos.filter((p) => {
      if (!p.isActive) return false;
      if (p.startsAt && new Date(p.startsAt) > now) return false;
      if (p.expiresAt && new Date(p.expiresAt) < now) return false;
      return true;
    });

    promos = activePromos.filter((p) => {
      if (!Array.isArray(p.productIds) || p.productIds.length === 0) {
        return true;
      }
      return p.productIds.includes(matched!.id);
    });

    const returnPolicy = (returnPolicies as ReturnPolicy[])[0];
    returnPolicyContent = returnPolicy?.content || "";
  } catch (error) {
    console.error("Error fetching flash sell product:", error);
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-sm text-gray-600">Product details লোড হচ্ছে...</p>
        </div>
      }
    >
      <div className="min-h-screen bg-white">
        <section className="max-w-7xl mx-auto px-5 py-8 md:py-10">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <BreadCrumb title={product?.title} />
            </div>

            <div className="grid gap-5 md:gap-6 lg:grid-cols-[minmax(0,1.05fr),minmax(0,1fr)]">
              <div className="rounded-2xl border border-gray-200 bg-white/90 p-3 md:p-4 flex items-center justify-center overflow-hidden">
                <ImageGallery images={product?.images} />
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 md:p-5 lg:p-6 overflow-hidden">
                <ProductDetails product={product} promos={promos} />
              </div>
            </div>

            <div
              id="return-policy"
              className="rounded-2xl border border-gray-200 bg-white/90 sm:p-5 p-3 mt-2 overflow-hidden"
            >
              <Tab product={product} returnPolicyContent={returnPolicyContent} />
            </div>

            <div className="mt-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">
                সম্পর্কিত পণ্যসমূহ
              </h2>
              <RelatedProducts id={slug} />
            </div>
          </div>
        </section>
      </div>
    </Suspense>
  );
};

export default FlashSellProductPage;
