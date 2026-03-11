"use client";
import Quantity from "../../../../components/shared/Quantity";
import AddToCartButton from "./AddToCartButton";

interface ProductCartProps {
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
  quantity: number;
  onChangeQuantity: (q: number) => void;
  disabled?: boolean;
}

const ProductCart = ({
  price,
  productId,
  product,
  quantity,
  onChangeQuantity,
  disabled = false,
}: ProductCartProps) => {
  const handleIncrement = async () => {
    onChangeQuantity(quantity + 1);
  };
  const handleDecrement = async () => {
    if (quantity > 1) {
      onChangeQuantity(quantity - 1);
    }
  };
  return (
    <div className="flex gap-4 items-center min-[410px]:flex-row min-[810px]:flex-row md:flex-col flex-col">
      <div className=" self-start">
        <Quantity
          quantity={quantity}
          handleDecrement={handleDecrement}
          handleIncrement={handleIncrement}
          primary
        />
      </div>
      <div className=" flex-1 w-full">
        <AddToCartButton totalQuantity={quantity} price={price} productId={productId} product={product} disabled={disabled} />
      </div>
    </div>
  );
};

export default ProductCart;
