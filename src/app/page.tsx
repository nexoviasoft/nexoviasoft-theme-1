import Category from "./_components/Category";
import ForYou from "./_components/ForYou";
import HeroCarousel from "./_components/HeroCarousel";
import FeatureSection from "../components/FeatureSection";
import { Suspense } from "react";
import FlashSale from "./_components/Flash Sale/FlashSale";
import TopProduct from "./_components/Top Products/TopProduct";
import TrendingProducts from "./_components/TrendingProducts";
import ThemeLoader from "../components/shared/ThemeLoader";
import ScrollAnimation from "../components/shared/ScrollAnimation";

export default function Home() {
  return (
    <Suspense
      fallback={
        <ThemeLoader fullPage message="হোম পেইজ লোড হচ্ছে, একটু অপেক্ষা করুন..." />
      }
    >
      <main className="space-y-8 overflow-hidden">
        <ScrollAnimation>
          <HeroCarousel />
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.1}>
          <Category />
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.2}>
          <TrendingProducts />
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.3}>
          <TopProduct />
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.4}>
          <FlashSale />
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.5}>
          <ForYou />
        </ScrollAnimation>
        
        {/* <FeatureSection /> */}
      </main>
    </Suspense>
  );
}
