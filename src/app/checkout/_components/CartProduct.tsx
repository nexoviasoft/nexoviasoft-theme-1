"use client";
import Quantity from "../../../components/shared/Quantity";
import { useCart } from "../../../context/CartContext";
import formatteeNumber from "../../../utils/formatteNumber";
import { Badge } from "antd";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaXmark } from "react-icons/fa6";

interface ItemProps {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    thumbnail?: string;
    images?: { url: string; alt?: string }[];
    price?: number;
    discountPrice?: number;
    isFlashSell?: boolean;
    flashSellPrice?: number;
  };
}

const CartProduct = ({
  item,
  onChangeQuantity,
}: {
  item: ItemProps;
  onChangeQuantity?: (item: ItemProps, nextQty: number) => void | Promise<void>;
}) => {
  const quantity = item?.quantity ?? 0;
  const { updateCartItem, deleteCartItem } = useCart();

  const imageUrl = item.product.thumbnail || item.product.images?.[0]?.url || "/placeholder.png";
  const imageAlt = item.product.images?.[0]?.alt || item.product.name || "product";

  const handleIncrement = async () => {
    try {
      // If this is a query product (id: 0), add it to cart first
      if (item.id === 0) {
        await onChangeQuantity?.(item, quantity + 1);
        toast.success("Quantity updated");
      } else {
        await updateCartItem(item.id, quantity + 1);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const handleDecrement = async () => {
    if (quantity <= 1) {
      // If quantity is 1 and we decrement, remove the item
      await handleDelete();
      return;
    }

    try {
      // If this is a query product (id: 0), add it to cart first
      if (item.id === 0) {
        await onChangeQuantity?.(item, quantity - 1);
        toast.success("Quantity updated");
      } else {
        await updateCartItem(item.id, quantity - 1);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart");
    }
  };

  const handleDelete = async () => {
    try {
      // If this is a query product (id: 0), just reload the page without the query param
      if (item.id === 0) {
        window.location.href = "/checkout";
        return;
      }
      await deleteCartItem(item.id);
      toast.success("Product removed");
    } catch (error) {
      console.error("Error deleting cart item:", error);
      toast.error("Failed to remove product");
    }
  };
  return (
    <div className=" flex justify-between gap-3">
      <div className="flex gap-2.5">
        <Badge count={quantity} size="small">
          <div className=" overflow-hidden border border-gray-100">
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={70}
              height={70}
              className=" aspect-[6/5] object-cover"
            />
          </div>
        </Badge>
        <div className=" flex flex-col justify-between py-0.5">
          <p className=" text-sm font-medium text-gray-800 line-clamp-2 leading-tight max-w-[140px] sm:max-w-xs">{item.product.name}</p>
          <div className="scale-90 origin-left">
            <Quantity
              quantity={quantity}
              handleDecrement={handleDecrement}
              handleIncrement={handleIncrement}
              secondary
            />
          </div>
        </div>
      </div>
      <div className=" flex flex-col justify-between items-end py-0.5">
        <div className="flex flex-col items-end">
          <p className=" text-sm font-bold text-gray-900">{formatteeNumber(item.unitPrice * quantity)}৳</p>
          {typeof item.product.price === "number" && item.product.price > item.unitPrice && (
            <p className=" text-[11px] text-gray-500">
              <span className="line-through">{formatteeNumber(item.product.price * quantity)}৳</span>
            </p>
          )}
        </div>
        <button
          onClick={handleDelete}
          className=" text-gray-400 hover:text-red-500 transition-all p-1"
        >
          <FaXmark size={14} />
        </button>
      </div>
    </div>
  );
};

export default CartProduct;
