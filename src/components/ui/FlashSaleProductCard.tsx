 "use client";
 
 import React from "react";
 import ProductCard from "./ProductCard";
 
 type ProductCardProps = React.ComponentProps<typeof ProductCard>;
 
 const FlashSaleProductCard = ({
   product,
   detailHref,
 }: ProductCardProps) => {
   const slug =
     (product as any)?.sku ||
     (product as any)?.SKU ||
     (product as any)?.documentId ||
     (typeof (product as any)?.id === "number"
       ? String((product as any).id)
       : undefined);
 
   const flashHref = detailHref ?? (slug ? `/flashSell/${slug}` : undefined);
 
   return <ProductCard product={product as any} detailHref={flashHref} />;
 };
 
 export default FlashSaleProductCard;
 
