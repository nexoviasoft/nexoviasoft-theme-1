"use client";
import CouponCode from "./CouponCode";
import formatteeNumber from "../../../utils/formatteNumber";
import { PromoCode } from "../../../lib/api-services";

interface CheckoutCartProps {
  /** Contact phone from system user (store admin). Shown as "যেকোনো সমস্যায় নির্দ্বিধায় যোগাযোগ করুন- {phone}" */
  contactPhone?: string | null;
  items: {
    id: number;
    product: { id: number; name: string; thumbnail?: string; images?: { url: string; alt?: string }[] };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  shipping: number;
  grandTotal: number;
  promoCode: string;
  setPromoCode: (v: string) => void;
  applyPromo: () => void;
  promoLoading?: boolean;
  promo: PromoCode | null;
  availablePromos?: PromoCode[];
  availablePromosLoading?: boolean;
  applyPromoFromButton?: (code: string) => void | Promise<void>;
}

const CheckoutCart = ({
  contactPhone,
  items,
  subtotal,
  discount,
  shipping,
  grandTotal,
  promoCode,
  setPromoCode,
  applyPromo,
  promoLoading,
  promo,
  availablePromos,
  availablePromosLoading,
  applyPromoFromButton,
}: CheckoutCartProps) => {
  return (
    <section className=" border border-gray-100 bg-white p-4 shadow-sm flex flex-col gap-4 sticky top-4 rounded-lg">
      <h1 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
        আপনার কার্ট
      </h1>
      {/* coupon code  */}
      <CouponCode
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        applyPromo={applyPromo}
        loading={promoLoading}
        appliedPromo={promo}
        availablePromos={availablePromos}
        availablePromosLoading={availablePromosLoading}
        onSelectPromo={(code) => applyPromoFromButton?.(code)}
      />
      {/* total */}
      <div className="border-t border-gray-100 pt-3">
        {/* item summary */}
        <div className="flex flex-col gap-2 pb-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-xs text-black font-medium"
            >
              <span className="line-clamp-1 max-w-[70%]">
                {item.product.name} <span className="text-gray-400">× {item.quantity}</span>
              </span>
              <span className="font-medium text-gray-900">{formatteeNumber(item.unitPrice * item.quantity)}৳</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 py-3 border-t border-gray-100 border-dashed">
          <div className="flex justify-between items-center text-sm text-black font-medium">
            <p>Subtotal</p>
            <p className="font-medium text-gray-900">{formatteeNumber(subtotal)}৳</p>
          </div>
          {promo && (
            <div className="flex justify-between items-center text-sm text-green-600 font-medium">
              <p>Promo ({promo.code})</p>
              <p>-{formatteeNumber(discount)}৳</p>
            </div>
          )}
          <div className="flex justify-between items-center text-sm text-black font-medium">
            <p>Shipping</p>
            <p className="font-medium text-gray-900">{formatteeNumber(shipping)}৳</p>
          </div>
        </div>
        <div className="flex justify-between items-center border-t border-gray-100 pt-3">
          <p className="text-base font-bold text-gray-900">Total</p>
          <p className="text-lg font-black text-gray-900">{formatteeNumber(grandTotal)}৳</p>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 mt-2 bg-gray-50 py-2  border border-gray-100 rounded-lg">
        যেকোনো সমস্যায় নির্দ্বিধায় যোগাযোগ করুন- <span className="text-gray-600 font-medium">{contactPhone?.trim() || "01774617452"}</span>
      </p>
    </section>
  );
};

export default CheckoutCart;
