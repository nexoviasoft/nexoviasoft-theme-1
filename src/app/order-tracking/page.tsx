"use client";

import { Suspense } from "react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getApiUrl } from "@/lib/api-config";
import { useSearchParams } from "next/navigation";
import CopyButton from "@/components/shared/CopyButton";
import {
  FiCheckCircle,
  FiClock,
  FiMapPin, 
  FiPackage,
  FiSearch,
  FiTruck,
  FiXCircle,
  FiCreditCard,
  FiUser,
  FiCalendar,
  FiRefreshCw,
  FiDollarSign,
} from "react-icons/fi";
import ScrollAnimation from "@/components/shared/ScrollAnimation";

interface StatusHistoryEntry {
  id: number;
  orderId: number;
  previousStatus?: string | null;
  newStatus: string;
  comment?: string | null;
  createdAt: string;
}

interface TrackedOrder {
  id: number;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingTrackingId?: string;
  shippingProvider?: string;
  createdAt: string;
  message?: string;
  statusHistory?: StatusHistoryEntry[];
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return {
        color: "bg-emerald-100 text-emerald-800 border-emerald-200",
        icon: FiCheckCircle,
        label: "ডেলিভারড",
      };
    case "pending":
      return {
        color: "bg-amber-100 text-amber-800 border-amber-200",
        icon: FiClock,
        label: "পেন্ডিং",
      };
    case "cancelled":
      return {
        color: "bg-rose-100 text-rose-800 border-rose-200",
        icon: FiXCircle,
        label: "বাতিল",
      };
    case "shipped":
      return {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: FiTruck,
        label: "শিপড",
      };
    case "processing":
      return {
        color: "bg-violet-100 text-violet-800 border-violet-200",
        icon: FiPackage,
        label: "প্রসেসিং",
      };
    case "paid":
      return {
        color: "bg-teal-100 text-teal-800 border-teal-200",
        icon: FiCreditCard,
        label: "পেইড",
      };
    case "returned":
      return {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: FiRefreshCw,
        label: "ফেরত",
      };
    case "refunded":
      return {
        color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
        icon: FiDollarSign,
        label: "রিফান্ডেড",
      };
    default:
      return {
        color: "bg-gray-100 text-gray-700 border-gray-200",
        icon: FiClock,
        label: status.toUpperCase(),
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("bn-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const fetchOrder = useCallback(async (rawId: string) => {
    const trimmed = rawId.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      setError(null);
      setOrder(null);

      const res = await axios.get(
        getApiUrl(`/orders/track/${encodeURIComponent(trimmed)}`),
      );
      const apiData = res.data?.data;

      if (apiData) {
        setOrder({
          id: apiData.orderId,
          status: apiData.status,
          totalAmount: apiData.totalAmount ?? 0,
          paymentMethod: apiData.paymentMethod ?? "DIRECT",
          customerName: apiData.customerName,
          customerPhone: apiData.customerPhone,
          customerAddress: apiData.customerAddress,
          shippingTrackingId:
            apiData.trackingId ?? apiData.shippingTrackingId ?? trimmed,
          shippingProvider: apiData.shippingProvider,
          createdAt: apiData.createdAt,
          message: apiData.message,
          statusHistory: (apiData.statusHistory ?? []).sort(
            (a: StatusHistoryEntry, b: StatusHistoryEntry) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        });
      } else {
        setError("অর্ডার খুঁজে পাওয়া যায়নি। ট্র্যাকিং আইডি আবার চেক করুন।");
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string; error?: string } };
      };
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        "অর্ডার খুঁজে পাওয়া যায়নি। ট্র্যাকিং আইডি আবার চেক করুন।";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fromQuery = searchParams.get("trackingId");
    if (fromQuery) {
      setTrackingId(fromQuery);
      fetchOrder(fromQuery);
    }
  }, [searchParams, fetchOrder]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetchOrder(trackingId);
  };

  const statusConfig = order ? getStatusConfig(order.status) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <ScrollAnimation>
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              অর্ডার ট্র্যাকিং
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium max-w-2xl mx-auto">
              আপনার অর্ডারের বর্তমান অবস্থা তাৎক্ষণিকভাবে জানতে ট্র্যাকিং আইডি
              ব্যবহার করুন
            </p>
          </div>
        </ScrollAnimation>

        {/* Search Card - Premium look */}
        <ScrollAnimation delay={0.1}>
          <div className="bg-white rounded-xl  border border-gray-100/80 p-2 sm:p-4">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="ট্র্যাকিং আইডি লিখুন (যেমন: TRK-123456 বা 123123)"
                  className="block w-full pl-14 pr-5 py-4 bg-gray-50/70 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-black/10 focus:border-black/30 focus:bg-white transition-all duration-300 text-base font-medium shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !trackingId.trim()}
                className="inline-flex items-center justify-center px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-black/20 min-w-[140px] transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    খুঁজছি...
                  </span>
                ) : (
                  "ট্র্যাক করুন"
                )}
              </button>
            </form>
          </div>
        </ScrollAnimation>

        {error && (
          <ScrollAnimation>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex items-center gap-4 text-rose-800">
              <FiXCircle className="h-6 w-6 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </ScrollAnimation>
        )}

        {/* Order Details – Premium UI after search */}
        {order && statusConfig && (
          <div className="space-y-8">
            {/* Status Card – Hero section */}
            <ScrollAnimation delay={0.2}>
              <div className="bg-white rounded-3xl shadow-md border border-gray-100/60 overflow-hidden">
                <div className="p-6 sm:p-8 bg-gradient-to-br from-gray-50 via-white to-gray-50/80 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">
                          অর্ডার আইডি
                        </span>
                        <span className="px-3 py-1 rounded-full bg-black text-white text-sm font-bold tracking-wide shadow">
                          #{order.id}
                        </span>
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
                        {order.totalAmount.toLocaleString("bn-BD")} ৳
                      </h2>
                      <p className="mt-3 text-sm text-gray-600 flex items-center gap-2 font-medium">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <div
                      className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 ${statusConfig.color} shadow-md`}
                    >
                      <statusConfig.icon className="w-6 h-6" />
                      <span className="text-lg font-extrabold">
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Two Column Info */}
                <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  {/* Customer Info */}
                  <div className="bg-gradient-to-br from-gray-50/70 to-white p-6 rounded-xl border border-gray-100 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow">
                        <FiUser className="w-5 h-5 text-white" />
                      </div>
                      কাস্টমার তথ্য
                    </h3>
                    <div className="space-y-5 text-sm">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          নাম
                        </p>
                        <p className="font-semibold text-gray-900">
                          {order.customerName || "N/A"}
                        </p>
                      </div>
                      {order.customerPhone && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            ফোন
                          </p>
                          <p className="font-semibold text-gray-900">
                            {order.customerPhone}
                          </p>
                        </div>
                      )}
                      {order.customerAddress && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            ঠিকানা
                          </p>
                          <p className="font-semibold text-gray-900 leading-relaxed">
                            {order.customerAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping & Payment */}
                  <div className="bg-gradient-to-br from-gray-50/70 to-white p-6 rounded-2xl border border-gray-100 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow">
                    <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow">
                        <FiPackage className="w-5 h-5 text-white" />
                      </div>
                      শিপিং ও পেমেন্ট
                    </h3>
                    <div className="space-y-5 text-sm">
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          পেমেন্ট মেথড
                        </p>
                        <p className="font-semibold text-gray-900">
                          {order.paymentMethod}
                        </p>
                      </div>
                      {order.shippingProvider && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            কুরিয়ার
                          </p>
                          <p className="font-semibold text-gray-900">
                            {order.shippingProvider}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                          ট্র্যাকিং আইডি
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-base">
                            {order.shippingTrackingId || trackingId}
                          </span>
                          <CopyButton
                            text={order.shippingTrackingId || trackingId || ""}
                            className="text-gray-500 hover:text-black p-2.5 rounded-full hover:bg-gray-100 transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Timeline – Premium version */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <ScrollAnimation delay={0.3}>
                <div className="bg-white rounded-xl shadow-md border border-gray-100/60 overflow-hidden">
                  <div className="p-6 sm:p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      অর্ডারের যাত্রাপথ
                    </h3>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-7 before:h-full before:w-1 before:bg-gradient-to-b before:from-gray-200 before:via-gray-100 before:to-transparent">
                      {order.statusHistory.map((entry, index) => {
                        const isLatest = index === 0;
                        const config = getStatusConfig(entry.newStatus);

                        return (
                          <div
                            key={entry.id}
                            className="relative flex gap-6 group"
                          >
                            <div
                              className={`absolute left-0 flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white shadow-lg transition-all duration-300 z-10 ${
                                isLatest
                                  ? "bg-black text-white scale-110 ring-4 ring-black/10 shadow-2xl"
                                  : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                              }`}
                            >
                              <config.icon className="h-6 w-6" />
                            </div>

                            <div className="flex-1 pt-3 pl-20">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                <p
                                  className={`text-lg font-extrabold transition-colors ${
                                    isLatest ? "text-gray-900" : "text-gray-600"
                                  }`}
                                >
                                  {config.label}
                                </p>
                                <time className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full whitespace-nowrap border border-gray-200 shadow-sm">
                                  {formatDate(entry.createdAt)}
                                </time>
                              </div>

                              {entry.comment && (
                                <p className="text-sm font-medium text-gray-600 bg-gray-50 rounded-2xl p-4 border border-gray-100/80 mt-2 leading-relaxed">
                                  {entry.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-gray-600">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
