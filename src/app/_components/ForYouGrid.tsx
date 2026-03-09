"use client";

import { motion } from "framer-motion";
import ProductCard from "../../components/ui/ProductCard";
import { Product } from "../../lib/api-services";

interface ForYouGridProps {
  products: Product[];
}

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

const ForYouGrid = ({ products }: ForYouGridProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="grid sm:grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] grid-cols-[repeat(auto-fit,_minmax(160px,_1fr))] w-full gap-3"
    >
      {products.map((product) => (
        <motion.div key={product.id || product.sku} variants={itemVariants}>
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
    </motion.div>
  );
};

export default ForYouGrid;
