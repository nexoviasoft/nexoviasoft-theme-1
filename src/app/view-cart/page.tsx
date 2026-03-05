"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import CartProduct from "@/app/checkout/_components/CartProduct";
import { FiShoppingBag, FiArrowRight } from "react-icons/fi";
import ScrollAnimation from "@/components/shared/ScrollAnimation";
import { Suspense } from "react";
import formatteeNumber from "@/utils/formatteNumber";

function ViewCartContent() {
  const { cart, loading } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-500">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = cart?.totalPrice || 0;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50/50 flex items-center justify-center px-4">
        <ScrollAnimation>
          <div className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-gray-100">
              <FiShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">আপনার কার্ট খালি</h1>
              <p className="text-gray-500">
                আপনার কার্টে এখনো কোনো পণ্য যোগ করা হয়নি। কেনাকাটা শুরু করতে নিচে ক্লিক করুন।
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
            >
              কেনাকাটা করুন
            </Link>
          </div>
        </ScrollAnimation>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">শপিং কার্ট ({items.length})</h1>
        </ScrollAnimation>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-3">
            <ScrollAnimation delay={0.1}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 sm:p-4 hover:bg-gray-50/50 transition-colors">
                      <CartProduct item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <ScrollAnimation delay={0.2}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">অর্ডার সামারি</h2>
                
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>সাবটোটাল</span>
                    <span className="font-bold text-gray-900">{formatteeNumber(subtotal)} ৳</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600 text-sm">
                    <span>ডেলিভারি চার্জ</span>
                    <span className="text-xs text-gray-500">(চেকআউটে যুক্ত হবে)</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">সর্বমোট</span>
                    <span className="text-lg font-black text-gray-900">{formatteeNumber(subtotal)} ৳</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-lg hover:bg-gray-900 transition-all shadow-md shadow-black/10 hover:shadow-lg hover:-translate-y-0.5"
                >
                  চেকআউট করুন
                  <FiArrowRight className="w-4 h-4" />
                </Link>
                
                <p className="text-[10px] text-center text-gray-400 mt-3">
                  ট্যাক্স এবং শিপিং খরচ চেকআউট পেজে গণনা করা হবে
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewCartPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <ViewCartContent />
    </Suspense>
  );
}
