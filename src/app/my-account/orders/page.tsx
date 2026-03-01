"use client";

import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState, useCallback, FormEvent } from "react";
import axios from "axios";
import { getApiUrl, getApiHeaders } from "../../../lib/api-config";
import { TbCurrencyTaka } from "react-icons/tb";
import { FiPackage, FiTruck } from "react-icons/fi";
import Link from "next/link";
import ThemeLoader from "../../../components/shared/ThemeLoader";
import CopyButton from "../../../components/shared/CopyButton";
import { Button, Modal } from "antd";
import toast from "react-hot-toast";

interface OrderItem {
  id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    id: number;
    name: string;
    image?: string;
    sku?: string;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  customerAddress?: string;
  createdAt: string;
  items: OrderItem[];
   shippingTrackingId?: string;
   shippingProvider?: string;
}

interface TrackingStatusHistoryEntry {
  id: number;
  orderId: number;
  previousStatus?: string | null;
  newStatus: string;
  comment?: string | null;
  createdAt: string;
}

interface TrackingOrderStatus {
  orderId: number;
  status: string;
  message?: string;
  trackingId?: string;
  shippingProvider?: string;
  statusHistory?: TrackingStatusHistoryEntry[];
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-gray-200 text-gray-800";
    case "pending":
      return "bg-gray-100 text-gray-700";
    case "cancelled":
      return "bg-gray-300 text-gray-800";
    case "shipped":
      return "bg-gray-200 text-gray-800";
    case "paid":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusMessage = (status: string) => {
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    pending: "Your order has been received and is awaiting confirmation.",
    processing: "Your order is being prepared for shipment.",
    paid: "Payment received. Your order is being processed.",
    shipped: "Your order has been shipped and is on its way.",
    delivered: "Your order has been delivered successfully.",
    cancelled: "This order has been cancelled.",
    refunded: "This order has been refunded.",
  };
  return map[s] ?? "Your order status is being updated.";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const Orders = () => {
  const { userSession } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(
    null,
  );
  const [trackingId, setTrackingId] = useState("");
  const [trackingResult, setTrackingResult] =
    useState<TrackingOrderStatus | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  // Per-order tracking: which order's tracking is expanded and cached result
  const [trackingExpandedOrderId, setTrackingExpandedOrderId] = useState<
    number | null
  >(null);
  const [trackingDataByOrderId, setTrackingDataByOrderId] = useState<
    Record<number, TrackingOrderStatus>
  >({});
  const [trackingLoadingOrderId, setTrackingLoadingOrderId] = useState<
    number | null
  >(null);
  const [cancelModalOrderId, setCancelModalOrderId] = useState<number | null>(
    null,
  );

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl("/orders/my-orders"), {
        headers: getApiHeaders(userSession?.accessToken),
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [userSession?.accessToken]);

  useEffect(() => {
    if (userSession?.accessToken) {
      fetchOrders();
    }
  }, [userSession, fetchOrders]);

  const isOrderCancellable = (order: Order): boolean => {
    if (order.status.toLowerCase() === "cancelled") return false;
    if (order.status.toLowerCase() === "delivered") return false;

    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    return hoursDiff <= 24;
  };

  const showCancelModal = (orderId: number) => {
    setCancelModalOrderId(orderId);
  };

  const hideCancelModal = () => {
    setCancelModalOrderId(null);
  };

  const handleConfirmCancelOrder = async () => {
    const orderId = cancelModalOrderId;
    if (!orderId) return;

    try {
      setCancellingOrderId(orderId);
      hideCancelModal();
      await axios.patch(
        getApiUrl(`/orders/${orderId}/cancel`),
        {},
        {
          headers: getApiHeaders(userSession?.accessToken),
        },
      );
      toast.success("Order cancelled successfully!");
      fetchOrders(); // Refresh orders list
    } catch (error: unknown) {
      console.error("Error cancelling order:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "Failed to cancel order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const fetchTrackingByOrder = useCallback(
    async (order: Order) => {
      const id = order.shippingTrackingId?.trim();
      if (!id) return;

      try {
        setTrackingLoadingOrderId(order.id);
        const response = await axios.get(
          getApiUrl(`/orders/track/${encodeURIComponent(id)}`),
        );
        const apiData = response.data?.data;
        if (apiData) {
          const result: TrackingOrderStatus = {
            orderId: apiData.orderId,
            status: apiData.status,
            message: apiData.message,
            trackingId: apiData.trackingId,
            shippingProvider: apiData.shippingProvider,
            statusHistory: apiData.statusHistory ?? [],
          };
          setTrackingDataByOrderId((prev) => ({ ...prev, [order.id]: result }));
          setTrackingExpandedOrderId(order.id);
        }
      } catch (error) {
        console.error("Error tracking order:", error);
        setTrackingDataByOrderId((prev) => ({
          ...prev,
          [order.id]: {
            orderId: order.id,
            status: "error",
            message:
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ||
              "ট্র্যাকিং ডেটা লোড করা যায়নি।",
          },
        }));
        setTrackingExpandedOrderId(order.id);
      } finally {
        setTrackingLoadingOrderId(null);
      }
    },
    [],
  );

  const handleTrackOrder = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedId = trackingId.trim();
    if (!trimmedId) return;

    try {
      setTrackingLoading(true);
      setTrackingError(null);
      setTrackingResult(null);

      const response = await axios.get(
        getApiUrl(`/orders/track/${encodeURIComponent(trimmedId)}`),
      );

      const apiData = response.data?.data;
      if (apiData) {
        setTrackingResult({
          orderId: apiData.orderId,
          status: apiData.status,
          message: apiData.message,
          trackingId: apiData.trackingId,
          shippingProvider: apiData.shippingProvider,
          statusHistory: apiData.statusHistory ?? [],
        });
      } else {
        setTrackingError(
          "অর্ডার খুঁজে পাওয়া যায়নি। ট্র্যাকিং আইডি আবার চেক করুন।",
        );
      }
    } catch (error: unknown) {
      console.error("Error tracking order:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "অর্ডার খুঁজে পাওয়া যায়নি। ট্র্যাকিং আইডি আবার চেক করুন।";
      setTrackingError(errorMessage);
    } finally {
      setTrackingLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeLoader
        message="আপনার সাম্প্রতিক অর্ডারগুলো লোড হচ্ছে, একটু অপেক্ষা করুন।"
      />
    );
  }

  if (orders.length === 0) {
    return (
      <div className="w-full flex flex-col gap-5">
        <div className="rounded-2xl bg-black text-white shadow-md px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80">
                My account
              </p>
              <h2 className="text-xl md:text-2xl font-semibold">My orders</h2>
              <p className="text-xs sm:text-sm text-white/90 max-w-md">
                আপনি এখনও কোনো অর্ডার করেননি। প্রথম অর্ডারের সাথে প্রিমিয়াম
                অভিজ্ঞতা শুরু করুন।
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm">
              <FiPackage className="text-white/90" />
              <span>অর্ডার হিস্টোরি এখানে দেখা যাবে</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[220px]">
          <div className="max-w-md w-full text-center space-y-4 rounded-2xl border border-dashed border-gray-300 bg-white/70 px-6 py-8">
            <p className="text-sm font-semibold text-gray-900">
              বর্তমানে কোনো অর্ডার পাওয়া যায়নি
            </p>
            <p className="text-sm text-gray-600">
              শপ থেকে আপনার পছন্দের পণ্য নির্বাচন করে এখনই প্রথম অর্ডার করে
              ফেলুন।
            </p>
            <div className="flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                শপে যান
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="w-full flex flex-col gap-5">
      <div className="rounded-2xl bg-black text-white shadow-md px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80">
              My account
            </p>
            <h2 className="text-xl md:text-2xl font-semibold">My orders</h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-md">
              আপনার সব অর্ডারের স্ট্যাটাস, পেমেন্ট এবং পণ্য তালিকা প্রিমিয়াম
              ভিউতে দেখুন।
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <div className="rounded-xl bg-white/10 px-3 py-2 flex items-center gap-2">
              <FiPackage className="text-white/90" />
              <span className="text-[11px] font-medium">
                মোট অর্ডার {orders.length}
              </span>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 flex items-center gap-2">
              <FiTruck className="text-white/90" />
              <span className="text-[11px] font-medium">
                ট্র্যাক করুন ডেলিভারি স্ট্যাটাস
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleTrackOrder}
          className="mt-4 grid grid-cols-1 sm:grid-cols-[minmax(0,_2fr)_auto] gap-2 items-center"
        >
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            placeholder="ট্র্যাকিং আইডি লিখুন"
            className="w-full rounded-full border border-gray-300 bg-white/90 px-4 py-2 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={trackingLoading || !trackingId.trim()}
            className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {trackingLoading ? "ট্র্যাক করা হচ্ছে..." : "অর্ডার ট্র্যাক করুন"}
          </button>
        </form>

        {trackingError && (
            <p className="mt-2 text-[11px] sm:text-xs text-white/90">
            {trackingError}
          </p>
        )}

        {trackingResult && (
          <div className="mt-3 rounded-xl bg-white/10 px-3 py-2 text-[11px] sm:text-xs space-y-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-white/90/80">Tracking ID:</span>{" "}
              <span className="font-semibold">
                {trackingResult.trackingId || trackingId}
              </span>
              <CopyButton
                text={trackingResult.trackingId || trackingId || ""}
                className="!bg-white/20 !border-gray-200/50 !text-white/90 !hover:bg-white/30"
                size={12}
              />
            </p>
            <p>
              <span className="text-white/90/80">Status:</span>{" "}
              <span className="font-semibold">
                {trackingResult.status?.toUpperCase()}
              </span>
            </p>
            {trackingResult.message && (
              <p className="text-white/90">{trackingResult.message}</p>
            )}
            {trackingResult.shippingProvider && (
              <p>
                <span className="text-white/90/80">Provider:</span>{" "}
                <span className="font-semibold">
                  {trackingResult.shippingProvider}
                </span>
              </p>
            )}
            <p>
              <span className="text-white/90/80">Order ID:</span>{" "}
              <span className="font-semibold">#{trackingResult.orderId}</span>
            </p>

            {trackingResult.statusHistory &&
              trackingResult.statusHistory.length > 0 && (
                <div className="mt-2 border-t border-gray-200/30 pt-2">
                  <p className="text-[10px] font-semibold text-white/90 mb-1">
                    স্ট্যাটাস হিস্টোরি
                  </p>
                  <ul className="space-y-1">
                    {trackingResult.statusHistory.map((entry) => (
                      <li key={entry.id} className="flex flex-col">
                        <span className="font-medium">
                          {formatDate(entry.createdAt)} —{" "}
                          {entry.newStatus.toUpperCase()}
                        </span>
                                <span className="text-white/80">
                                  {entry.comment ||
                                    getStatusMessage(entry.newStatus)}
                                </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white/95 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-gray-500">
                  Order ID #{order.id}
                </p>
                <p className="text-sm text-gray-700">
                  Date: {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-4">
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Quantity: {item.quantity} ×{" "}
                        <span className="inline-flex items-center">
                          <TbCurrencyTaka size={12} />
                          {item.unitPrice}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center text-primary font-semibold">
                      <TbCurrencyTaka size={18} />
                      <span>{item.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Payment: {order.paymentMethod}
                  </p>
                  {order.customerAddress && (
                    <p className="text-xs sm:text-sm text-gray-600">
                      Address: {order.customerAddress}
                    </p>
                  )}
                </div>
                <div className="inline-flex items-center rounded-full bg-gray-100 px-4 py-2 text-primary text-base sm:text-lg font-semibold">
                  <TbCurrencyTaka size={24} />
                  <span>{order.totalAmount}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {order.shippingTrackingId && (
                  <>
                    <button
                      type="button"
                      onClick={() => fetchTrackingByOrder(order)}
                      disabled={trackingLoadingOrderId === order.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs sm:text-sm font-medium text-black hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiTruck size={14} />
                      {trackingLoadingOrderId === order.id
                        ? "লোড হচ্ছে..."
                        : "ট্র্যাক করুন"}
                    </button>
                    <CopyButton
                      text={order.shippingTrackingId}
                      size={12}
                      className="!px-2.5 !py-1"
                    />
                  </>
                )}
                {isOrderCancellable(order) && (
                  <button
                    onClick={() => showCancelModal(order.id)}
                    disabled={cancellingOrderId === order.id}
                    className="px-4 py-2 rounded-full bg-black text-white text-xs sm:text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {cancellingOrderId === order.id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}
              </div>
              {trackingExpandedOrderId === order.id &&
                trackingDataByOrderId[order.id] && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-emerald-50/30 p-4 space-y-2">
                    <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-800">
                      ট্র্যাকিং স্ট্যাটাস —{" "}
                      <span className="font-mono">
                        {trackingDataByOrderId[order.id].trackingId ||
                          order.shippingTrackingId}
                      </span>
                      <CopyButton
                        text={
                          trackingDataByOrderId[order.id].trackingId ||
                          order.shippingTrackingId ||
                          ""
                        }
                        size={12}
                      />
                    </p>
                    <p>
                      <span className="text-xs text-gray-600">স্ট্যাটাস:</span>{" "}
                      <span
                        className={`text-sm font-semibold ${getStatusColor(
                          trackingDataByOrderId[order.id].status,
                        )}`}
                      >
                        {trackingDataByOrderId[order.id].status?.toUpperCase()}
                      </span>
                    </p>
                    {trackingDataByOrderId[order.id].message && (
                      <p className="text-xs text-gray-700">
                        {trackingDataByOrderId[order.id].message}
                      </p>
                    )}
                    {trackingDataByOrderId[order.id].shippingProvider && (
                      <p className="text-xs text-gray-600">
                        প্রোভাইডার:{" "}
                        {trackingDataByOrderId[order.id].shippingProvider}
                      </p>
                    )}
                    {trackingDataByOrderId[order.id].statusHistory &&
                      trackingDataByOrderId[order.id].statusHistory!.length >
                        0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-black mb-2">
                          স্ট্যাটাস হিস্টোরি
                        </p>
                        <ul className="space-y-1.5">
                          {trackingDataByOrderId[
                            order.id
                          ].statusHistory!.map((entry) => (
                            <li
                              key={entry.id}
                              className="flex flex-col text-xs"
                            >
                              <span className="font-medium text-gray-800">
                                {formatDate(entry.createdAt)} —{" "}
                                {entry.newStatus.toUpperCase()}
                              </span>
                              <span className="text-gray-600">
                                {entry.comment ||
                                  getStatusMessage(entry.newStatus)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>

    <Modal
      title="Cancel Order"
      open={cancelModalOrderId !== null}
      onCancel={hideCancelModal}
      footer={[
        <Button key="cancel" onClick={hideCancelModal}>
          No, Keep Order
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          loading={cancellingOrderId === cancelModalOrderId}
          onClick={handleConfirmCancelOrder}
        >
          Yes, Cancel Order
        </Button>,
      ]}
    >
      <p>Are you sure you want to cancel this order?</p>
    </Modal>
    </>
  );
};

export default Orders;
