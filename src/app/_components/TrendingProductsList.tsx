"use client";

import { motion } from "framer-motion";
import { itemVariants } from "../../lib/animations";
import EmblaCarousel from "../../components/shared/EmblaCarousel";
import ProductCard from "../../components/ui/ProductCard";
import { Product } from "../../lib/api-services";

interface TrendingProductsListProps {
  products: Product[];
}

const TrendingProductsList = ({ products }: TrendingProductsListProps) => {
  return (
    <EmblaCarousel dragFree arrowButtons>
      {products.map((product) => (
        <motion.div
          key={product.id || product.sku}
          className="[flex:0_0_65%] min-[400px]:[flex:0_0_50%]  min-[500px]:[flex:0_0_45%] sm:[flex:0_0_35%] md:[flex:0_0_30%] min-[880px]:[flex:0_0_27%] lg:[flex:0_0_19%] flex flex-col justify-between gap-3 py-3 cursor-pointer select-none"
          variants={itemVariants}
        >
          <ProductCard
            product={{
              id: product.id,
              name: product.name,
              title: product.name,
              documentId: product.id?.toString(),
              sku: product.sku,
              price: product.price,
              discountPrice: product.discountPrice,
              thumbnail: product.thumbnail,
              images:
                product.images?.map((img) => ({
                  name: img.alt || "Product image",
                  url: img.url,
                })) || [],
              description: product.description,
              shortDescription: product.description,
              reviews: [],
            }}
          />
        </motion.div>
      ))}
    </EmblaCarousel>
  );
};

export default TrendingProductsList;
