"use client";

import { createContext, ReactNode, useContext, useEffect, useState, useCallback } from "react";

// Define TypeScript interfaces
interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

interface Product {
  id: number;
  name: string;
  sku?: string;
  price?: number;
  discountPrice?: number;
  images?: ProductImage[];
  thumbnail?: string;
  isFlashSell?: boolean;
  flashSellPrice?: number;
}

interface CartProduct {
  id: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Cart {
  items: CartProduct[];
  totalItems: number;
  totalPrice: number;
}
  // dgdggg


interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  refetch: () => Promise<void>;
  updateCartItem: (
    cartItemId: number,
    quantity: number
  ) => Promise<void>;
  deleteCartItem: (cartItemId: number) => Promise<void>;
  addCartItem: (
    productId: number,
    quantity: number,
    product?: Product,
    unitPrice?: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Context Provider Component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = "local_cart";

  const loadFromStorage = (): Cart | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: [], totalItems: 0, totalPrice: 0 };
      const items = JSON.parse(raw) as CartProduct[];
      const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const totalPrice = items.reduce((sum, item) => sum + Number(item.unitPrice || 0) * Number(item.quantity || 0), 0);
      return { items, totalItems, totalPrice };
    } catch {
      return { items: [], totalItems: 0, totalPrice: 0 };
    }
  };

  const saveToStorage = (items: CartProduct[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const loaded = loadFromStorage();
      setCart(loaded);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Function to update cart item quantity
  const updateCartItem = async (
    cartItemId: number,
    quantity: number
  ): Promise<void> => {
    const current = loadFromStorage();
    const items = current?.items || [];
    if (quantity <= 0) {
      const next = items.filter((i) => i.id !== cartItemId);
      saveToStorage(next);
      setCart(loadFromStorage());
      return;
    }
    const next = items.map((i) =>
      i.id === cartItemId ? { ...i, quantity, totalPrice: Number(i.unitPrice || 0) * Number(quantity || 0) } : i,
    );
    saveToStorage(next);
    setCart(loadFromStorage());
  };

  // Function to remove a cart item
  const deleteCartItem = async (cartItemId: number): Promise<void> => {
    const current = loadFromStorage();
    const items = current?.items || [];
    const next = items.filter((i) => i.id !== cartItemId);
    saveToStorage(next);
    setCart(loadFromStorage());
  };

  // function to add cart item
  const addCartItem = async (
    productId: number,
    quantity: number,
    product?: Product,
    unitPrice?: number
  ): Promise<void> => {
    const current = loadFromStorage();
    const items = current?.items || [];
    const existing = items.find((i) => i.product?.id === productId || i.id === productId);
    const hasDiscount =
      typeof product?.discountPrice === "number" &&
      typeof product?.price === "number" &&
      product.discountPrice > 0 &&
      product.discountPrice < product.price;
    const effectiveUnitPrice =
      product?.isFlashSell && typeof product?.flashSellPrice === "number"
        ? product.flashSellPrice
        : hasDiscount
          ? Number(product?.discountPrice)
          : typeof product?.price === "number"
            ? product.price
            : typeof unitPrice === "number"
              ? unitPrice
              : existing?.unitPrice ?? 0;
    const baseProduct =
      product ||
      existing?.product || {
        id: productId,
        name: "",
        sku: "",
        price: Number(effectiveUnitPrice || 0),
      };
    const newItem: CartProduct = {
      id: productId,
      product: baseProduct,
      quantity: Number(quantity || 0),
      unitPrice: Number(effectiveUnitPrice || 0),
      totalPrice: Number(effectiveUnitPrice || 0) * Number(quantity || 0),
    };
    const next = existing
      ? items.map((i) => (i.id === (existing.id || productId) ? newItem : i))
      : [...items, newItem];
    saveToStorage(next);
    setCart(loadFromStorage());
  };

  // function to clear cart
  const clearCart = async (): Promise<void> => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    setCart({ items: [], totalItems: 0, totalPrice: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        refetch: fetchCart,
        updateCartItem,
        deleteCartItem,
        addCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook for using Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
