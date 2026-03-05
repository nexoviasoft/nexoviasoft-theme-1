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
        color: "bg-green-100 text-green-700 border-green-200",
        icon: FiCheckCircle,
        label: "ডেলিভারড",
      };
    case "pending":
      return {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        icon: FiClock,
        label: "পেন্ডিং",
      };
    case "cancelled":
      return {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: FiXCircle,
        label: "বাতিল",
      };
    case "shipped":
      return {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: FiTruck,
        label: "শিপড",
      };
    case "processing":
      return {
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: FiPackage,
        label: "প্রসেসিং",
      };
    case "paid":
      return {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: FiCreditCard,
        label: "পেইড",
      };
    case "returned":
      return {
        color: "bg-orange-50 text-orange-700 border-orange-200",
        icon: FiRefreshCw,
        label: "ফেরত",
      };
    case "refunded":
      return {
        color: "bg-purple-50 text-purple-700 border-purple-200",
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
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Section */}
        <ScrollAnimation>
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              অর্ডার ট্র্যাকিং
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto text-sm md:text-base font-medium">
              আপনার অর্ডারের বর্তমান অবস্থা জানতে ট্র্যাকিং আইডি ব্যবহার করুন
            </p>
          </div>
        </ScrollAnimation>

        {/* Search Card */}
        <ScrollAnimation delay={0.1}>
          <div className="bg-white rounded-2xl shadow-md p-2 sm:p-2.5 border border-gray-100">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="আপনার ট্র্যাকিং আইডি লিখুন (যেমন: TRK-123456)"
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-black/5 focus:bg-white transition-all duration-200 text-sm font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !trackingId.trim()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-black/10 min-w-[120px]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    খুজছি...
                  </span>
                ) : (
                  "ট্র্যাক করুন"
                )}
              </button>
            </form>
          </div>
        </ScrollAnimation>

        {/* Error Message */}
        {error && (
          <ScrollAnimation>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-700 shadow-sm">
              <FiXCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          </ScrollAnimation>
        )}

        {/* Order Details */}
        {order && statusConfig && (
          <div className="space-y-5">
            {/* Status Overview Card */}
            <ScrollAnimation delay={0.2}>
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                <div className="p-5 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          অর্ডার আইডি
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-bold tracking-wide">
                          #{order.id}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                        {order.totalAmount} ৳
                      </h2>
                      <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5 font-medium">
                        <FiCalendar className="w-3.5 h-3.5" />
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color}`}
                      >
                        <statusConfig.icon className="w-4 h-4" />
                        <span className="text-sm font-bold">
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50/30 rounded-xl p-5 border border-gray-100/50 hover:border-gray-200/50 transition-colors">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <FiUser className="w-3.5 h-3.5 text-black" />
                      </div>
                      কাস্টমার তথ্য
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          নাম
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {order.customerName || "N/A"}
                        </p>
                      </div>
                      {order.customerPhone && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            ফোন
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {order.customerPhone}
                          </p>
                        </div>
                      )}
                      {order.customerAddress && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            ঠিকানা
                          </p>
                          <p className="text-sm font-bold text-gray-900 leading-relaxed">
                            {order.customerAddress}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50/30 rounded-xl p-5 border border-gray-100/50 hover:border-gray-200/50 transition-colors">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <FiPackage className="w-3.5 h-3.5 text-black" />
                      </div>
                      শিপিং ও পেমেন্ট
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          পেমেন্ট মেথড
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {order.paymentMethod}
                        </p>
                      </div>
                      {order.shippingProvider && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            কুরিয়ার সার্ভিস
                          </p>
                          <p className="text-sm font-bold text-gray-900">
                            {order.shippingProvider}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          ট্র্যাকিং আইডি
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded-md border border-gray-200 text-xs shadow-sm">
                            {order.shippingTrackingId || trackingId}
                          </span>
                          <CopyButton
                            text={order.shippingTrackingId || trackingId || ""}
                            className="text-gray-400 hover:text-black hover:bg-white p-1.5 rounded-full transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            {/* Timeline */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <ScrollAnimation delay={0.3}>
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="p-5 sm:p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                      অর্ডার টাইমলাইন
                    </h3>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-gray-100 before:via-gray-100 before:to-transparent">
                      {order.statusHistory.map((entry, index) => {
                        const isLatest = index === 0;
                        const config = getStatusConfig(entry.newStatus);
                        return (
                          <div
                            key={entry.id}
                            className="relative flex gap-5 group"
                          >
                            <div
                              className={`absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white shadow-sm transition-all duration-300 z-10 ${
                                isLatest
                                  ? "bg-black text-white scale-110 shadow-md ring-2 ring-gray-100"
                                  : "bg-gray-50 text-gray-300 group-hover:bg-gray-100"
                              }`}
                            >
                              <config.icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1 pt-1 pl-10">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1.5">
                                <p
                                  className={`text-sm font-bold transition-colors ${
                                    isLatest ? "text-gray-900" : "text-gray-500"
                                  }`}
                                >
                                  {config.label}
                                </p>
                                <time className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md whitespace-nowrap border border-gray-100">
                                  {formatDate(entry.createdAt)}
                                </time>
                              </div>
                              {entry.comment && (
                                <p className="text-xs font-medium text-gray-500 bg-gray-50/50 rounded-lg p-3 border border-gray-100 inline-block mt-1">
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
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-500">লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <OrderTrackingContent />
    </Suspense>
  );
}
