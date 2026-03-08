"use client";
import { useAuth } from "../../../context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getApiUrl, getApiHeaders, API_CONFIG } from "../../../lib/api-config";
import {
  getCategories,
  getProductsByCategory,
  Product,
} from "../../../lib/api-services";
import type { Category } from "@/types/category";
import { Rate } from "antd";
import { FiChevronDown, FiMessageCircle, FiStar } from "react-icons/fi";

interface Review {
  id: number;
  productId: number;
  rating: number;
  title?: string;
  comment: string;
  product?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export default function Reviews() {
  const { userSession } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productId: 0,
    rating: 5,
    title: "",
    comment: "",
  });

  const fetchCategories = useCallback(async () => {
    try {
      const cats = await getCategories(API_CONFIG.companyId);
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const prods = await getProductsByCategory(
        API_CONFIG.companyId,
        selectedCategory,
      );
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [selectedCategory]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(getApiUrl("/reviews/my-reviews"), {
        headers: getApiHeaders(userSession?.accessToken),
      });
      setReviews(response.data.data || response.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [userSession?.accessToken]);

  useEffect(() => {
    if (userSession?.accessToken) {
      fetchCategories();
      fetchReviews();
    }
  }, [userSession, fetchCategories, fetchReviews]);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [selectedCategory, fetchProducts]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || !formData.comment) {
      alert("অনুগ্রহ করে একটি পণ্য নির্বাচন করুন এবং রিভিউ লিখুন");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(
        getApiUrl(`/reviews?companyId=${API_CONFIG.companyId}`),
        {
          productId: formData.productId,
          rating: formData.rating,
          title: formData.title || undefined,
          comment: formData.comment,
          userName: userSession?.name || userSession?.user?.name || "Customer",
        },
        {
          headers: getApiHeaders(userSession?.accessToken),
        },
      );
      alert("রিভিউ সফলভাবে জমা হয়েছে!");
      setFormData({
        productId: 0,
        rating: 5,
        title: "",
        comment: "",
      });
      setSelectedProduct(null);
      setShowForm(false);
      fetchReviews();
    } catch (error: unknown) {
      console.error("Error submitting review:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      alert(
        axiosError.response?.data?.message ||
          "রিভিউ জমা দেওয়া যায়নি। আবার চেষ্টা করুন।",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProduct(productId);
    setFormData({ ...formData, productId });
    setShowForm(true);
  };

  if (loading) {
    return (
      <section className="w-full flex justify-center items-center min-h-[320px]">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-4 py-1 border border-gray-100">
            <span className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
            <span className="text-[11px] font-medium text-gray-700">
              Loading your reviews
            </span>
          </div>
          <p className="text-sm text-gray-600">
            আপনার রিভিউ এবং ক্যাটাগরি তথ্য লোড হচ্ছে, একটু অপেক্ষা করুন।
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">
      <div className="rounded-2xl bg-black text-white shadow-md px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-100/90">
              আমার অ্যাকাউন্ট
            </p>
            <h2 className="text-xl md:text-2xl font-semibold">রিভিউ</h2>
            <p className="text-xs sm:text-sm text-gray-50/95 max-w-md">
              আপনার কেনা পণ্যের অভিজ্ঞতা শেয়ার করুন এবং পুরনো রিভিউগুলো এক
              জায়গায় দেখুন।
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs sm:text-sm">
            <FiStar className="text-gray-100" />
            <span>রেটিং দিয়ে অন্য ক্রেতাদের সাহায্য করুন</span>
          </div>
        </div>
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-50 px-4 py-4 sm:px-5 sm:py-5">
        <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600">
            <FiMessageCircle size={18} />
          </span>
          <span>রিভিউ লিখুন</span>
        </h3>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ক্যাটাগরি/সেক্টর অনুযায়ী ফিল্টার
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedProduct(null);
                    setShowForm(false);
                  }}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">একটি ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <FiChevronDown size={18} />
                </span>
              </div>
            </div>

            {selectedCategory && products.length > 0 ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পণ্য নির্বাচন করুন
                </label>
                <div className="relative">
                  <select
                    value={selectedProduct || ""}
                    onChange={(e) =>
                      handleProductSelect(Number(e.target.value))
                    }
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-900 shadow-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">একটি পণ্য নির্বাচন করুন</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FiChevronDown size={18} />
                  </span>
                </div>
              </div>
            ) : (
              <div className="opacity-60">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  পণ্য নির্বাচন করুন
                </label>
                <div className="relative">
                  <select
                    disabled
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 pr-10 text-sm text-gray-700 shadow-sm cursor-not-allowed"
                  >
                    <option value="">একটি পণ্য নির্বাচন করুন</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FiChevronDown size={18} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {showForm && selectedProduct && (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রেটিং
                </label>
                <Rate
                  value={formData.rating}
                  onChange={(value) =>
                    setFormData({ ...formData, rating: value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রিভিউ শিরোনাম (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="রিভিউ শিরোনাম লিখুন"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  রিভিউ লিখুন *
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder="আপনার রিভিউ লিখুন..."
                  rows={4}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "সাবমিট হচ্ছে..." : "রিভিউ সাবমিট করুন"}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-gray-50 px-4 py-4 sm:px-5 sm:py-5">
        <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600">
            <FiStar size={18} />
          </span>
          <span>আমার রিভিউ</span>
        </h3>
        {reviews.length === 0 ? (
          <p className="text-gray-600 text-sm">আপনি এখনও কোনো রিভিউ লিখেননি।</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {review.product?.name || `Product #${review.productId}`}
                    </h4>
                    {review.title && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        {review.title}
                      </p>
                    )}
                  </div>
                  <Rate disabled value={review.rating} />
                </div>
                <p className="text-sm text-gray-700 mt-1.5">{review.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
