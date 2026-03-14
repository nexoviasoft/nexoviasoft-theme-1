"use client";

import { FaEdit } from "react-icons/fa";
import {
  FiMail,
  FiUser,
  FiPhone,
  FiMapPin,
  FiTruck,
  FiPackage,
  FiMap,
  FiStar,
  FiLock,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import CopyButton from "../../../components/shared/CopyButton";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getApiUrl, getApiHeaders } from "../../../lib/api-config";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  district?: string;
  successfulOrdersCount?: number;
  cancelledOrdersCount?: number;
}

type OrderStats = {
  total: number;
  delivered: number;
  cancelled: number;
  inProgress: number;
};

type MyOrderSummary = {
  id: number;
  status?: string;
  createdAt?: string;
  shippingTrackingId?: string;
};

export default function Dashboard() {
  const { userSession, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<MyOrderSummary[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total: 0,
    delivered: 0,
    cancelled: 0,
    inProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl("/users/me"), {
        headers: getApiHeaders(userSession?.accessToken),
      }); const userData = response.data.data;
      setProfile(userData);
      setEditData({
        name: userData.name || "",
        phone: userData.phone || "",
        address: userData.address || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userSession?.accessToken]);

  const fetchOrdersCount = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl("/orders/my-orders"), {
        headers: getApiHeaders(userSession?.accessToken),
      });
      const orders: MyOrderSummary[] = response.data.data || [];
      setRecentOrders(
        orders
          .filter((o) => o.shippingTrackingId?.trim())
          .slice(0, 5)
      );
      const delivered = orders.filter(
        (o) => (o.status || "").toLowerCase() === "delivered",
      ).length;
      const cancelled = orders.filter(
        (o) => (o.status || "").toLowerCase() === "cancelled",
      ).length;
      const inProgress = orders.filter((o) => {
        const s = (o.status || "").toLowerCase();
        return (
          s === "pending" ||
          s === "processing" ||
          s === "paid" ||
          s === "shipped"
        );
      }).length;

      setOrderStats({
        total: orders.length || 0,
        delivered,
        cancelled,
        inProgress,
      });
    } catch (error) {
      console.error("Error fetching orders count:", error);
    }
  }, [userSession?.accessToken]);

  useEffect(() => {
    if (!loading && !userSession) {
      const target = `/login?callbackUrl=${encodeURIComponent("/my-account/dashboard")}`;
      router.push(target);
      return;
    }
    if (userSession?.accessToken) {
      fetchProfile();
      fetchOrdersCount();
    }
  }, [loading, userSession, router, fetchProfile, fetchOrdersCount]);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const response = await axios.patch(getApiUrl("/users/me"), editData, {
        headers: getApiHeaders(userSession?.accessToken),
      });
      setProfile(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoading) {
    return (
      <section className="w-full flex justify-center items-center min-h-[320px]">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1 border border-gray-200">
            <span className="h-2 w-2 rounded-full bg-black animate-pulse" />
            <span className="text-[11px] font-medium text-gray-700">
              Loading your dashboard
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Fetching your profile and recent activity. Please wait a moment.
          </p>
        </div>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="w-full flex justify-center items-center min-h-[320px]">
        <div className="max-w-md w-full text-center space-y-3 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-6">
          <p className="text-sm font-semibold text-gray-800">
            প্রোফাইল লোড করা যায়নি
          </p>
          <p className="text-xs md:text-sm text-gray-700">
            অনুগ্রহ করে পেজটি রিফ্রেশ করুন বা একটু পরে আবার চেষ্টা করুন।
          </p>
        </div>
      </section>
    );
  }

  const firstLetter = (profile.name || profile.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  const profileCompletion = {
    name: Boolean(profile.name?.trim()),
    phone: Boolean(profile.phone?.trim()),
    address: Boolean(profile.address?.trim()),
  };
  const completionScore = Object.values(profileCompletion).filter(Boolean)
    .length;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="rounded-2xl bg-black text-white shadow-md px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white/80">
              আমার অ্যাকাউন্ট
            </p>
            <h2 className="text-xl md:text-2xl font-semibold">
              স্বাগতম, {profile.name || "customer"}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 max-w-md">
              আপনার ড্যাশবোর্ড থেকে অর্ডার, ঠিকানা এবং প্রোফাইল তথ্য এক জায়গা
              থেকে ম্যানেজ করুন।
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-3 py-2 sm:px-4 sm:py-3 backdrop-blur">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
                {firstLetter}
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide text-white/80">
                  লগইন করেছেন
                </span>
                <span className="text-sm sm:text-base font-medium truncate max-w-[180px] sm:max-w-[220px]">
                  {profile.email}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="rounded-xl bg-white/10 px-3 py-2 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-white/80">
                  প্রোফাইল সেটআপ
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  {completionScore}/3 সম্পন্ন
                </span>
              </div>
              <div className="rounded-xl bg-white/10 px-3 py-2 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-white/80">
                  অ্যাকাউন্ট স্ট্যাটাস
                </span>
                <span className="text-xs sm:text-sm font-medium">
                  সক্রিয় সদস্য
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              মোট অর্ডার
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {orderStats.total}
            </p>
            <Link
              href="/my-account/orders"
              className="mt-2 inline-flex text-xs font-medium text-black hover:text-gray-700"
            >
              অর্ডার দেখুন
            </Link>
          </div>
          <span className="h-10 w-10 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <FiPackage size={18} />
          </span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              ডেলিভারড
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {orderStats.delivered}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              সফল ডেলিভারি
            </p>
          </div>
          <span className="h-10 w-10 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center">
            <FiCheckCircle size={18} />
          </span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              চলমান
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {orderStats.inProgress}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              পেন্ডিং / শিপড
            </p>
          </div>
          <span className="h-10 w-10 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center">
            <FiClock size={18} />
          </span>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-gray-500">
              বাতিল
            </p>
            <p className="text-xl font-semibold text-gray-900">
              {orderStats.cancelled}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">বাতিল অর্ডার</p>
          </div>
          <span className="h-10 w-10 rounded-2xl bg-gray-200 text-gray-700 flex items-center justify-center">
            <FiXCircle size={18} />
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4 lg:gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                  <FiUser size={18} />
                </span>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    অ্যাকাউন্ট তথ্য
                  </h2>
                  <p className="text-xs text-gray-500">
                    দ্রুত চেকআউটের জন্য আপনার প্রোফাইল তথ্য আপডেট করুন।
                  </p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => {
                    setSaveError(null);
                    setIsEditing(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <FaEdit className="text-[11px]" />
                  প্রোফাইল সম্পাদনা
                </button>
              )}
            </div>

            {isEditing ? (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateProfile();
                }}
              >
                {saveError && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    {saveError}
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">
                      পূর্ণ নাম
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 focus-within:ring-2 focus-within:ring-gray-300">
                      <FiUser className="text-gray-400" size={16} />
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                        placeholder="আপনার পূর্ণ নাম"
                        className="w-full bg-transparent text-sm outline-none"
                        autoComplete="name"
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-600">
                      ফোন নম্বর
                    </label>
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 focus-within:ring-2 focus-within:ring-gray-300">
                      <FiPhone className="text-gray-400" size={16} />
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        placeholder="01XXXXXXXXX"
                        className="w-full bg-transparent text-sm outline-none"
                        autoComplete="tel"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-600">
                    পূর্ণ ঠিকানা
                  </label>
                  <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2 focus-within:ring-2 focus-within:ring-gray-300">
                    <FiMapPin className="mt-0.5 text-gray-400" size={16} />
                    <textarea
                      rows={3}
                      value={editData.address}
                      onChange={(e) =>
                        setEditData({ ...editData, address: e.target.value })
                      }
                      placeholder="বাড়ি / রাস্তা / এলাকা"
                      className="w-full bg-transparent text-sm outline-none resize-none"
                      autoComplete="street-address"
                      disabled={saving}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? "সেভ হচ্ছে..." : "পরিবর্তন সেভ করুন"}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setIsEditing(false);
                      setSaveError(null);
                      setEditData({
                        name: profile.name || "",
                        phone: profile.phone || "",
                        address: profile.address || "",
                      });
                    }}
                    className="inline-flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                    <FiUser size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      পূর্ণ নাম
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.name || "প্রদান করা হয়নি"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                    <FiPhone size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      ফোন নম্বর
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.phone || "প্রদান করা হয়নি"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-8 w-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                    <FiMapPin size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      পূর্ণ ঠিকানা
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {profile.address || "প্রদান করা হয়নি"}
                    </p>
                  </div>
                </div>
                {profile.district && (
                  <div className="flex items-start gap-3">
                    <span className="mt-1 h-8 w-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                      <FiMap size={16} />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        জেলা
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {profile.district}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                  <FiLock size={18} />
                </span>
                <div>
                  <h2 className="text-base md:text-lg font-semibold text-gray-900">
                    Login & security
                  </h2>
                  <p className="text-xs text-gray-500">
                    ইমেইল এবং পাসওয়ার্ড সংক্রান্ত তথ্য
                  </p>
                </div>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <FaEdit className="text-[11px]" />
                Reset password
              </Link>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Email
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50/70 px-3 py-2">
                  <FiMail className="text-gray-400" size={16} />
                  <p className="text-sm font-medium text-gray-900 break-all">
                    {profile.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Password
                  </p>
                  <div className="flex items-center gap-1">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className="h-2 w-2 bg-gray-500 rounded-full inline-block"
                        />
                      ))}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700">
                  <FiCheckCircle />
                  Signed in
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white/90 shadow-sm px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                <FiTruck size={18} />
              </span>
              <div>
                <h2 className="text-base md:text-lg font-semibold text-gray-900">
                  ট্র্যাকিং আইডি কপি
                </h2>
                <p className="text-xs text-gray-500">
                  সাম্প্রতিক অর্ডারের ট্র্যাকিং আইডি এক ক্লিকে কপি করুন
                </p>
              </div>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200 bg-gray-50/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-gray-600 shrink-0">
                      অর্ডার #{order.id}
                    </span>
                    <span className="font-mono text-sm font-semibold text-gray-800 truncate">
                      {order.shippingTrackingId}
                    </span>
                  </div>
                  <CopyButton
                    text={order.shippingTrackingId || ""}
                    size={12}
                    className="!px-2 !py-0.5 shrink-0"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              ট্র্যাকিং আইডি সহ কোনো অর্ডার নেই। অর্ডার সেকশনে যান।
            </p>
          )}
        </div>

        {/* Quick actions section removed as requested */}
      </div>
    </div>
  );
}
