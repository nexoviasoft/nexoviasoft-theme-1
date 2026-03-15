import { useCart } from "../../../../context/CartContext";
import { TbCurrencyTaka } from "react-icons/tb";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { } from "../../../../context/CartContext";

interface AddToCartButtonProps {
  totalQuantity: number;
  price: number;
  productId: number;
  product?: {
    id: number;
    name: string;
    thumbnail?: string;
    images?: { url: string; alt?: string }[];
    price?: number;
    discountPrice?: number;
  };
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  totalQuantity,
  price,
  productId,
  product,
  disabled = false,
}) => {
  const { addCartItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (disabled) {
      toast.error("Size এবং Quantity নির্বাচন করুন");
      return;
    }
    if (!productId) {
      toast.error("Product not found");
      return;
    }

    try {
      setLoading(true);
      await addCartItem(productId, totalQuantity, product, price);
      toast.success("Added to cart");
      router.push("/view-cart");
    } catch (error: unknown) {
      const err = error as { message?: string };
      const msg = err?.message || "Failed to add to cart";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const total = Number(price || 0) * totalQuantity;

  return (
    <button
      onClick={handleAdd}
      disabled={loading || disabled}
      className="btn-circle w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 transition-all ease-linear duration-200 px-4 py-1.5 rounded-3xl text-white sm:text-base text-sm disabled:opacity-70"
    >
      <span>{loading ? "Adding..." : "কার্টে যোগ করুন -"}</span>
      <div className=" flex items-center">
        <TbCurrencyTaka className=" sm:text-2xl text-xl" />
        <h2 className=" mt-[2px]  sm:text-xl font-bold text-lg">
          {new Intl.NumberFormat("en-US").format(total)}
        </h2>
      </div>
    </button>
  );
};

export default AddToCartButton;
