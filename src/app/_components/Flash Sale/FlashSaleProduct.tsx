import { getFlashSaleProducts, Product } from "../../../lib/api-services";
import FlashSaleCarousel from "./FlashSaleCarousel";

const FlashSaleProduct = async () => {
  const flashSaleProducts: Product[] = await getFlashSaleProducts();

  if (!flashSaleProducts || flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <div>
      <div>
        <FlashSaleCarousel products={flashSaleProducts} />
      </div>
    </div>
  );
};

export default FlashSaleProduct;
