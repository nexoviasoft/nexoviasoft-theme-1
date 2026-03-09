import { Suspense } from "react";
import { RiShoppingBag3Line } from "react-icons/ri";
import SideBar from "./_components/Products/products_layout/SideBar";
import TopBar from "./_components/Products/products_layout/TopBar";
import ProductsBody from "./_components/Products/ProductsBody";
import ThemeLoader from "../../components/shared/ThemeLoader";

const Products = () => {
  return (
    <Suspense fallback={<ThemeLoader message="পণ্য তালিকা লোড হচ্ছে..." />}>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="pt-8 pb-6 border-b border-gray-200">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <RiShoppingBag3Line className="text-3xl" /> আমাদের কালেকশন
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  সেরা মানের পণ্য কিনুন সবচেয়ে কম দামে
                </p>
              </div>
              <div className="w-full md:w-auto md:min-w-[220px]">
                <div className="flex justify-start md:justify-end">
                  <TopBar />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col min-[950px]:flex-row py-6 gap-6">
            <div className=" min-[950px]:block hidden w-full flex-[0_0_25%]">
              <SideBar />
            </div>
            <div className=" w-full min-[950px]:flex-[0_0_75%]">
              <ProductsBody />
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Products;
