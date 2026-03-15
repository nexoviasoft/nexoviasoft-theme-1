"use client";

import { PromoCode } from "../../../lib/api-services";

interface CouponCodeProps {
  promoCode: string;
  setPromoCode: (v: string) => void;
  applyPromo: () => void;
  loading?: boolean;
  appliedPromo?: PromoCode | null;
  availablePromos?: PromoCode[];
  availablePromosLoading?: boolean;
  onSelectPromo?: (code: string) => void | Promise<void>;
  /** When true (product checkout), show only the instruction text, no coupon chips/buttons */
  isProductCheckout?: boolean;
}

const COUPON_INSTRUCTION_TEXT = "নিচের কুপনে ক্লিক করলেই কুপনটি অটো অ্যাপ্লাই হবে।";

const CouponCode = ({
  promoCode,
  setPromoCode,
  applyPromo,
  loading,
  appliedPromo,
  availablePromos,
  availablePromosLoading,
  onSelectPromo,
  isProductCheckout,
}: CouponCodeProps) => {
  const hasAvailablePromos = (availablePromos ?? []).length > 0;
  const fallbackCode = (appliedPromo?.code || promoCode).trim();
  const showFallbackChip = !hasAvailablePromos && !!fallbackCode;

  const showInstructionText = hasAvailablePromos && !availablePromosLoading;

  if (isProductCheckout) {
    return (
      <div className="flex flex-col gap-2">
        {showInstructionText && (
          <p className="text-xs sm:text-sm text-gray-700">
            {COUPON_INSTRUCTION_TEXT}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Info text - শুধুমাত্র প্রোডাক্টে প্রমোকোড থাকলে দেখাবে */}
      {showInstructionText && (
        <p className="text-xs sm:text-sm text-gray-700">
          {COUPON_INSTRUCTION_TEXT}
        </p>
      )}

      {availablePromosLoading && (
        <p className="text-xs text-primary">Available coupons লোড হচ্ছে...</p>
      )}

      {hasAvailablePromos && !availablePromosLoading && (
        <div className="mt-1 flex flex-wrap gap-2">
          {availablePromos!.map((promo) => {
            const isActive = appliedPromo?.code === promo.code;
            return (
              <button
            key={promo.id}
            type="button"
            onClick={() => onSelectPromo?.(promo.code)}
            className={`text-xs px-3 py-1  border transition-colors !rounded-full ${
              isActive
                ? "bg-primary text-white border-primary"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary/10"
            }`}
          >
                <span className="font-semibold">{promo.code}</span>
                <span className="ml-1 text-[11px] text-gray-600">
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}% ছাড়`
                    : `${promo.discountValue}৳ ছাড়`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {showFallbackChip && (
        <div className="mt-1 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSelectPromo?.(fallbackCode)}
            disabled={loading}
            className="text-xs px-3 py-1  border transition-colors bg-gray-100 text-gray-700 border-gray-300 hover:bg-primary/10 disabled:opacity-70 !rounded-full"
          >
            <span className="font-semibold">{fallbackCode}</span>
            <span className="ml-1 text-[11px] text-gray-600">
              {loading ? "Applying..." : "ক্লিক করে অ্যাপ্লাই করুন"}
            </span>
          </button>
        </div>
      )}

      {appliedPromo && (
        <p className="text-sm text-green-600">
          Applied coupon: <span className="font-semibold">{appliedPromo.code}</span>
        </p>
      )}
    </div>
  );
};

export default CouponCode;
