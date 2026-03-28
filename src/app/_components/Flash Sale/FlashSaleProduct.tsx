import FlashSaleProductCard from "../../../components/ui/FlashSaleProductCard";
import { Product } from "../../../lib/api-services";
import FlashSaleCarousel from "./FlashSaleCarousel";

const mapToCardProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  documentId: product.id?.toString(),
  sku: product.sku,
  price: product.price,
  discountPrice: product.flashSellPrice ?? product.discountPrice ?? product.price,
  thumbnail:
    product.thumbnail ||
    (product.images && product.images[0] ? product.images[0].url : undefined),
  images:
    product.images?.map((img) => ({
      name: img.alt || "Product image",
      url: img.url,
    })) || [],
  description: product.description,
  shortDescription: product.description,
});

const FlashSaleProduct = async ({
  products,
  layout = "carousel",
}: {
  products: Product[];
  layout?: "carousel" | "grid";
}) => {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      {layout === "carousel" ? (
        <FlashSaleCarousel products={products} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.sku || product.id}
              className="flex flex-col justify-between gap-3 cursor-pointer select-none"
            >
              <FlashSaleProductCard product={mapToCardProduct(product) as any} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FlashSaleProduct;
