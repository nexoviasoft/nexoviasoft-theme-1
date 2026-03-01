import SideBar from "./_components/side_bar/SideBar";
import MobileTabs from "./_components/MobileTabs";

const Dashboardlayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 py-6 md:py-8">
        <div className="md:hidden mb-4">
          <MobileTabs />
        </div>
        <div className="grid gap-4 md:gap-6 lg:gap-8 md:grid-cols-[260px,minmax(0,1fr)]">
          <div className="md:pt-2 hidden md:block">
            <SideBar />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-4 md:px-6 md:py-6 lg:px-7 lg:py-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboardlayout;
