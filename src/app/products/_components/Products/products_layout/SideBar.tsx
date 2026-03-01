import ActiveFilter from "./ActiveFilter";
import Availability from "./Availability";
import PriceFilter from "./PriceFilter";
import ShopByCategory from "./ShopByCategory";

const SideBar = () => {
  return (
    <div className="min-[950px]:sticky min-[950px]:top-[90px] min-[950px]:max-h-max">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-6">
        <ActiveFilter />
        <PriceFilter />
        <Availability />
        <ShopByCategory />
      </div>
    </div>
  );
};

export default SideBar;
