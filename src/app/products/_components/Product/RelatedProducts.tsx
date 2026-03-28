import EmblaCarousel from "../../../../components/shared/EmblaCarousel";
import ProductCard from "../../../../components/ui/ProductCard";
import {
  getProductBySlug,
  getProductsByCategory,
  Product,
} from "../../../../lib/api-services";
import { FiGrid } from "react-icons/fi";

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
  description?: string;
  shortDescription?: string;
  price?: number;
  discountPrice?: number;
}

// Helper function to map REST API product to component format
function mapProductToCardFormat(apiProduct: Product): ProductProps {
  const off =
    apiProduct.discountPrice && apiProduct.price
      ? Math.round(
          ((apiProduct.price - apiProduct.discountPrice) / apiProduct.price) *
            100,
        )
      : 0;

  const images: ImageProps[] =
    apiProduct.images?.map((img, index) => ({
      name: img.alt || `Image ${index + 1}`,
      url: img.url,
    })) || [];

  const variant: VariantProps[] = [
    {
      price: Number(apiProduct.price),
      size: "Default",
      available_quantity: 100, // Default value - would need to come from inventory if available
      stock_status: apiProduct.isActive ? "in_stock" : "out_of_stock",
    },
  ];

  return {
    SKU: apiProduct.sku,
    documentId: apiProduct.id.toString(),
    off,
    title: apiProduct.name,
    images,
    reviews: [],
    variant,
    description: apiProduct.description,
    shortDescription: apiProduct.description,
    price: Number(apiProduct.price),
    discountPrice: apiProduct.discountPrice
      ? Number(apiProduct.discountPrice)
      : 0,
  };
}

const RelatedProducts = async ({ id }: { id: string }) => {
  let relatedProducts: ProductProps[] = [];

  try {
    // `id` here is the slug/SKU from the route
    const currentProduct = await getProductBySlug(id);
    const categoryName = currentProduct.category?.name;

    const allProducts = categoryName
      ? await getProductsByCategory(undefined, categoryName)
      : [];

    // Filter out the current product and limit to 10
    relatedProducts = allProducts
      .filter((p) => p.id !== currentProduct.id)
      .slice(0, 10)
      .map(mapProductToCardFormat);
  } catch (error) {
    console.error("Error fetching related products:", error);
    // Return empty array on error
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiGrid size={18} />
          </span>
          <div className="flex flex-col">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              সম্পর্কিত পণ্যসমূহ
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              একই ক্যাটাগরির আরও কিছু পছন্দের পণ্য
            </p>
          </div>
        </div>
      </div>
      <div>
        <EmblaCarousel dragFree arrowButtons>
          {relatedProducts.map((item, index) => (
            <div
              key={item.documentId || index}
              className="[flex:0_0_65%] min-[400px]:[flex:0_0_50%]  min-[500px]:[flex:0_0_45%] sm:[flex:0_0_35%] md:[flex:0_0_30%] min-[880px]:[flex:0_0_27%] lg:[flex:0_0_19%] flex flex-col justify-between gap-3 py-3 cursor-pointer select-none"
            >
              <ProductCard product={item} />
            </div>
          ))}
        </EmblaCarousel>
      </div>
    </section>
  );
};

export default RelatedProducts;
