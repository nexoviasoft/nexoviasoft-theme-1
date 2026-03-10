"use client";

import { motion } from "framer-motion";
import { itemVariants } from "../../../lib/animations";
import EmblaCarousel from "../../../components/shared/EmblaCarousel";
import FlashSaleProductCard from "../../../components/ui/FlashSaleProductCard";
import { Product } from "../../../lib/api-services";

interface FlashSaleCarouselProps {
  products: Product[];
}

const FlashSaleCarousel = ({ products }: FlashSaleCarouselProps) => {
  return (
    <EmblaCarousel dragFree arrowButtons>
      {products.map((product) => {
        const mappedProduct = {
          id: product.id,
          name: product.name,
          documentId: product.id?.toString(),
          sku: product.sku,
          price: product.price,
          discountPrice:
            product.flashSellPrice ?? product.discountPrice ?? product.price,
          thumbnail:
            product.thumbnail ||
            (product.images && product.images[0]
              ? product.images[0].url
              : undefined),
          images:
            product.images?.map((img) => ({
              name: img.alt || "Product image",
              url: img.url,
            })) || [],
          description: product.description,
          shortDescription: product.description,
        };

        return (
          <motion.div
            key={product.sku || product.id}
            className="[flex:0_0_65%] min-[400px]:[flex:0_0_50%]  min-[500px]:[flex:0_0_45%] sm:[flex:0_0_35%] md:[flex:0_0_30%] min-[880px]:[flex:0_0_27%] lg:[flex:0_0_19%] flex flex-col justify-between gap-3 py-3 cursor-pointer select-none"
            variants={itemVariants}
          >
            <FlashSaleProductCard product={mappedProduct} />
          </motion.div>
        );
      })}
    </EmblaCarousel>
  );
};

export default FlashSaleCarousel;
