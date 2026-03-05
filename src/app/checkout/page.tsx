"use client";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useEffect, useMemo, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CheckoutCart from "./_components/CheckoutCart";
import CustomerInfo from "./_components/CustomerInfo";
import toast from "react-hot-toast";
import {
  createOrder,
  getPublicPromocodes,
  PromoCode,
  getProduct,
  getProductBySlug,
  getSystemUserByCompanyId,
} from "../../lib/api-services";
import { API_CONFIG } from "../../lib/api-config";

const CheckoutContent = () => {
  const { userSession } = useAuth();
  const { cart, refetch } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [tShirtSize, setTShirtSize] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([]);
  const [availablePromosLoading, setAvailablePromosLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "prepaid">("cod");
  const [deliveryType, setDeliveryType] = useState<"inside" | "outside">(
    "inside",
  );
  const [enrichedItems, setEnrichedItems] = useState<
    Array<{
      id: number;
      product: {
        id: number;
        name: string;
        thumbnail?: string;
        images?: { url: string; alt?: string }[];
      };
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>
  >([]);
  const [companyPhone, setCompanyPhone] = useState<string | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [queryProduct, setQueryProduct] = useState<{
    id: number;
    product: {
      id: number;
      name: string;
      thumbnail?: string;
      images?: { url: string; alt?: string }[];
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  } | null>(null);
  const [initialPromoFromQuery, setInitialPromoFromQuery] = useState<
    string | null
  >(null);
  const hasAppliedInitialPromo = useRef(false);

  const getPromoProductIds = (p: PromoCode): number[] => {
    if (!Array.isArray((p as any).productIds)) return [];
    return (p.productIds as Array<number | string>)
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n));
  };

  // Fetch product from query params and promo code
  useEffect(() => {
    const rawProductId = searchParams.get("productId");
    const rawQuantity = searchParams.get("quantity");
    const companyId =
      searchParams.get("companyId") ||
      userSession?.companyId ||
      API_CONFIG.companyId;

    const promoFromQuery = searchParams.get("promoCode");

    if (promoFromQuery) {
      setInitialPromoFromQuery(promoFromQuery);
      setPromoCode(promoFromQuery);
    }

    if (rawProductId && companyId) {
      const parsedQuantity = (() => {
        if (!rawQuantity) return 1;
        const n = Number(rawQuantity);
        if (!Number.isFinite(n) || n <= 0) return 1;
        return Math.floor(n);
      })();

      const fetchQueryProduct = async () => {
        try {
          // Support both numeric IDs and slug/SKU values for productId
          const isNumericId = /^[0-9]+$/.test(rawProductId);
          const product = isNumericId
            ? await getProduct(Number(rawProductId), companyId)
            : await getProductBySlug(rawProductId, companyId);

          // Calculate final price (prioritizing flash sale, then discount)
          const finalPrice =
            (product as any).flashSellPrice ??
            product.discountPrice ??
            product.price;
          setQueryProduct({
            id: 0, // Temporary ID for query product
            product: {
              id: product.id,
              name: product.name,
              thumbnail: product.thumbnail,
              images: product.images,
            },
            quantity: parsedQuantity,
            unitPrice: finalPrice,
            totalPrice: finalPrice * parsedQuantity,
          });
        } catch (error) {
          console.error("Failed to fetch product from query params:", error);
          toast.error("Failed to load product");
        }
      };

      fetchQueryProduct();
    } else {
      setQueryProduct(null);
    }
  }, [searchParams, userSession?.companyId]);

  // Fetch system user (store) contact / branding for checkout
  useEffect(() => {
    const companyId = userSession?.companyId || API_CONFIG.companyId;
    if (!companyId) return;
    getSystemUserByCompanyId(companyId).then((user) => {
      if (user?.phone) setCompanyPhone(user.phone);
      if (user?.companyLogo) setCompanyLogo(user.companyLogo);
    });
  }, [userSession?.companyId]);

  // Prefill user info when logged in
  useEffect(() => {
    if (userSession?.user) {
      setName(userSession.user.name || "");
      setEmail(userSession.user.email || "");
      setPhone((userSession.user.phone as string | undefined) || "");
      setAddress((userSession.user.address as string | undefined) || "");
      setDistrict((userSession.user.district as string | undefined) || "");
    }
  }, [userSession]);

  // Fetch product details for cart items
  useEffect(() => {
    const enrichCartItems = async () => {
      if (
        !cart?.items ||
        !Array.isArray(cart.items) ||
        !cart.items.length ||
        !userSession?.companyId
      ) {
        setEnrichedItems([]);
        return;
      }

      try {
        const companyId = userSession.companyId || API_CONFIG.companyId;
        const enriched = await Promise.all(
          cart.items.map(async (item) => {
            // If product already has name, use it
            if (item.product?.name) {
              return item;
            }
            // Otherwise fetch product details
            try {
              const product = await getProduct(item.product.id, companyId);
              return {
                ...item,
                product: {
                  id: product.id,
                  name: product.name,
                  thumbnail: product.thumbnail,
                  images: product.images,
                },
              };
            } catch (error) {
              console.error(
                `Failed to fetch product ${item.product.id}:`,
                error,
              );
              return item;
            }
          }),
        );
        setEnrichedItems(enriched);
      } catch (error) {
        console.error("Failed to enrich cart items:", error);
        setEnrichedItems(Array.isArray(cart.items) ? cart.items : []);
      }
    };

    enrichCartItems();
  }, [cart?.items, userSession?.companyId]);

  // Clear query product if it's already in cart
  useEffect(() => {
    if (queryProduct && cart?.items) {
      const existsInCart = cart.items.some(
        (item) => item.product.id === queryProduct.product.id,
      );
      if (existsInCart) {
        setQueryProduct(null);
        // Remove query params from URL
        const url = new URL(window.location.href);
        url.searchParams.delete("productId");
        url.searchParams.delete("companyId");
        url.searchParams.delete("quantity");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [queryProduct, cart?.items]);

  // Combine cart items with query product if present
  const items = useMemo(() => {
    const cartItems =
      enrichedItems.length > 0
        ? enrichedItems
        : Array.isArray(cart?.items)
          ? cart.items
          : [];

    // If query product exists and not already in cart, add it
    if (queryProduct) {
      const existsInCart = cartItems.some(
        (item) => item.product.id === queryProduct.product.id,
      );
      if (!existsInCart) {
        return [queryProduct, ...cartItems];
      }
    }

    return cartItems;
  }, [enrichedItems, cart?.items, queryProduct]);
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.unitPrice || 0) * (item.quantity || 0),
        0,
      ),
    [items],
  );

  const discount = useMemo(() => {
    if (!promo) return 0;
    // validate min order
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) return 0;
    if (promo.discountType === "percentage") {
      return Math.min((subtotal * promo.discountValue) / 100, subtotal);
    }
    return Math.min(promo.discountValue, subtotal);
  }, [promo, subtotal]);

  const shippingCharge = deliveryType === "inside" ? 60 : 120;
  const total = Math.max(subtotal - discount, 0);
  const grandTotal = total + shippingCharge;

  // Auto apply promo from query once order subtotal is ready
  useEffect(() => {
    if (!initialPromoFromQuery || hasAppliedInitialPromo.current) return;
    if (subtotal <= 0) return;

    hasAppliedInitialPromo.current = true;
    applyPromoCore(initialPromoFromQuery);
  }, [initialPromoFromQuery, subtotal]);
  const applyPromoCore = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const companyId =
      searchParams.get("companyId") ||
      userSession?.companyId ||
      API_CONFIG.companyId;
    if (!companyId) {
      toast.error("Company information missing");
      return;
    }
    try {
      setPromoLoading(true);
      let promos: PromoCode[] = availablePromos;
      if (!promos.length) {
        promos = await getPublicPromocodes(companyId);
      }
      const now = new Date();
      const match = promos.find(
        (p) =>
          p.code.toLowerCase() === trimmed.toLowerCase() &&
          p.isActive &&
          (!p.startsAt || new Date(p.startsAt) <= now) &&
          (!p.expiresAt || new Date(p.expiresAt) >= now),
      );
      if (!match) {
        toast.error("Invalid promo code");
        setPromo(null);
        return;
      }
      // date checks (reuse now from above)
      if (match.startsAt && new Date(match.startsAt) > now) {
        toast.error("Promo not started");
        setPromo(null);
        return;
      }
      if (match.expiresAt && new Date(match.expiresAt) < now) {
        toast.error("Promo expired");
        setPromo(null);
        return;
      }
      if (match.minOrderAmount && subtotal < match.minOrderAmount) {
        toast.error(`Minimum order ${match.minOrderAmount} required`);
        setPromo(null);
        return;
      }

      // Ensure promo is applicable to at least one product in the cart, if productIds restriction exists
      if (Array.isArray(match.productIds) && match.productIds.length > 0) {
        const itemProductIds = items.map((i) => i.product.id);
        const promoProductIds = getPromoProductIds(match);
        const applicable = promoProductIds.some((id) =>
          itemProductIds.includes(id),
        );
        if (!applicable) {
          toast.error("এই কুপন আপনার নির্বাচিত প্রোডাক্টে প্রযোজ্য নয়");
          setPromo(null);
          return;
        }
      }
      setPromoCode(match.code);
      setPromo(match);
      toast.success("Promo applied");
    } catch (error) {
      console.error("Failed to apply promo", error);
      toast.error("Failed to apply promo");
    } finally {
      setPromoLoading(false);
    }
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    await applyPromoCore(promoCode);
  };

  const applyPromoFromButton = async (code: string) => {
    setPromoCode(code);
    await applyPromoCore(code);
  };

  // Prefetch available promos for auto-select buttons
  useEffect(() => {
    const fetchPromos = async () => {
      const companyId =
        searchParams.get("companyId") ||
        userSession?.companyId ||
        API_CONFIG.companyId;
      if (!companyId) {
        setAvailablePromos([]);
        return;
      }
      try {
        setAvailablePromosLoading(true);
        const promos = await getPublicPromocodes(companyId);
        const now = new Date();
        const activePromos = promos.filter((p) => {
          if (!p.isActive) return false;
          if (p.startsAt && new Date(p.startsAt) > now) return false;
          if (p.expiresAt && new Date(p.expiresAt) < now) return false;
          return true;
        });

        // Product checkout হলে: শুধু ওই প্রোডাক্টে assigned promo codes দেখাবে
        const hasSingleProductParam = !!searchParams.get("productId");
        const targetProductId = queryProduct?.product?.id;

        let relevantPromos: PromoCode[] = [];

        if (hasSingleProductParam && targetProductId) {
          relevantPromos = activePromos.filter(
            (p) =>
              Array.isArray(p.productIds) &&
              p.productIds.length > 0 &&
              getPromoProductIds(p).includes(targetProductId),
          );
        } else {
          // Regular checkout: show promos relevant to current cart items (including global promos)
          const itemProductIds = items.map((i) => i.product.id);
          relevantPromos = activePromos.filter((p) => {
            if (!Array.isArray(p.productIds) || p.productIds.length === 0) {
              return true; // global promo
            }
            const promoProductIds = getPromoProductIds(p);
            return promoProductIds.some((id) => itemProductIds.includes(id));
          });
        }

        setAvailablePromos(relevantPromos);
      } catch (error) {
        console.error("Failed to load promo codes", error);
        setAvailablePromos([]);
      } finally {
        setAvailablePromosLoading(false);
      }
    };

    fetchPromos();
  }, [searchParams, userSession?.companyId, items, queryProduct?.product?.id]);

  const handleOrder = async () => {
    const companyId =
      searchParams.get("companyId") ||
      userSession?.companyId ||
      API_CONFIG.companyId;

    if (!companyId) {
      toast.error("Store information missing");
      return;
    }

    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }

    if (!tShirtSize) {
      toast.error("টি-শার্ট সাইজ নির্বাচন করুন");
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Name, phone, and address are required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setOrderLoading(true);

      const combinedAddress = [district.trim(), address.trim()]
        .filter(Boolean)
        .join(", ");

      const payload: {
        customerId?: number;
        customerName?: string;
        customerPhone?: string;
        customerEmail?: string;
        customerAddress?: string;
        shippingAddress?: string;
        deliveryType?: "INSIDEDHAKA" | "OUTSIDEDHAKA";
        paymentMethod?: "DIRECT" | "COD";
        orderInfo?: string;
        items: { productId: number; quantity: number }[];
      } = {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        customerAddress: combinedAddress,
        shippingAddress: combinedAddress,
        deliveryType:
          deliveryType === "inside" ? "INSIDEDHAKA" : "OUTSIDEDHAKA",
        paymentMethod: paymentMethod === "cod" ? "COD" : "DIRECT",
        orderInfo: `tShirtSize ${tShirtSize}`,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      // If user is logged in, also attach customerId so backend links to their account
      if (userSession?.userId) {
        payload.customerId = userSession.userId;
        payload.customerEmail = email || userSession.user?.email || undefined;
      }

      await createOrder(payload, userSession?.accessToken, companyId);

      toast.success("Order placed successfully");

      if (userSession?.accessToken && userSession?.userId) {
        await refetch();
        router.push("/my-account/orders");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Order failed", error);
      toast.error("Order failed");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <section className="max-w-7xl mx-auto px-3 sm:px-5 py-6">
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            {companyLogo && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white border border-gray-100 overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={companyLogo}
                  alt="Store logo"
                  className="h-7 w-7 object-contain"
                />
              </div>
            )}
            <div className="flex flex-col">
              <p className="text-[10px] font-bold tracking-widest text-primary uppercase leading-tight">
                Checkout
              </p>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                অর্ডার সম্পূর্ণ করুন
              </h1>
            </div>
          </div>
        </div>

        <div className="grid gap-4 min-[820px]:grid-cols-5 min-[950px]:grid-cols-3">
          <div className="min-[820px]:col-span-3 min-[950px]:col-span-2">
            <CustomerInfo
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              district={district}
              setDistrict={setDistrict}
              address={address}
              setAddress={setAddress}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              deliveryType={deliveryType}
              setDeliveryType={setDeliveryType}
            tShirtSize={tShirtSize}
            setTShirtSize={setTShirtSize}
              onSubmit={handleOrder}
              submitting={orderLoading}
            />
          </div>
          <div className="min-[820px]:col-span-2 min-[950px]:col-span-1 order-first min-[820px]:order-none md:sticky md:top-24 self-start">
            <CheckoutCart
              contactPhone={companyPhone}
              items={items}
              subtotal={subtotal}
              discount={discount}
              total={total}
              shipping={shippingCharge}
              grandTotal={grandTotal}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              applyPromo={applyPromo}
              promoLoading={promoLoading}
              promo={promo}
              availablePromos={availablePromos}
              availablePromosLoading={availablePromosLoading}
              applyPromoFromButton={applyPromoFromButton}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const Checkout = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-[300px] flex items-center justify-center">
          <p className="text-sm text-primary">Checkout লোড হচ্ছে...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
};

export default Checkout;
