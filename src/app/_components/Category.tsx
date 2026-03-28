import { getCategories } from "../../lib/api-services";
import type { Category } from "../../types/category";
import { API_CONFIG } from "../../lib/api-config";
import Image from "next/image";
import Link from "next/link";
import EmblaCarousel from "../../components/shared/EmblaCarousel";
import { TbCategoryPlus } from "react-icons/tb";

const Category = async () => {
  // Note: Backend requires authentication. You may need to use a public token
  // or create public endpoints for categories
  let categories: Category[] = [];
  try {
    categories = await getCategories(API_CONFIG.companyId);
  } catch (error) {
    // console.error("Failed to load categories:", error);
    // categories will remain empty array
  }

  return (
    <section className=" max-w-7xl mx-auto px-5 md:pt-8 pt-3">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/5 ring-1 ring-primary/10 text-primary flex items-center justify-center">
              <TbCategoryPlus className="text-xl" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-gray-900">
                ক্যাটাগরি অনুযায়ী কেনাকাটা করুন
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">
                আপনার পছন্দের ক্যাটাগরি থেকে শপ করুন
              </p>
            </div>
          </div>
        </div>
        <div className=" sm:pt-5 pt-3 ">
          <EmblaCarousel dragFree arrowButtons>
            {categories.map((category: Category) => (
              <Link
                href={`/products?categories=${category.name}`}
                key={category.slug}
                className="
           
                [flex:0_0_22%]
                min-[680px]:[flex:0_0_18%]
                min-[820px]:[flex:0_0_15%]
                lg:[flex:0_0_13%] min-[1170px]:[flex:0_0_10%] rounded-lg  sm:w-28 w-16 flex flex-col justify-between gap-1 relative cursor-pointer select-none bg-[#F3F3F3] sm:p-2 p-1 group/category "
              >
                {(category.photo || category.image?.url) && (
                  <div className="bg-gray-200 overflow-hidden aspect-square relative rounded-lg">
                    <Image
                      src={category.photo || category.image!.url}
                      alt={category.image?.alt || category.name}
                      fill
                      sizes="(max-width: 640px) 4rem, 7rem"
                      className="object-cover transition-transform duration-300 ease-linear group-hover/category:scale-[1.05]"
                    />
                  </div>
                )}
                <div>
                  <h2 className=" sm:text-xs text-[10px] text-center line-clamp-1">
                    {category.name}
                  </h2>
                </div>
              </Link>
            ))}
          </EmblaCarousel>
        </div>
      </div>
    </section>
  );
};

export default Category;
