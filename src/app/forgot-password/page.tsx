"use client";

import { useState } from "react";
import { FiMail } from "react-icons/fi";
import Link from "next/link";
import { requestPasswordReset } from "../../lib/api-services";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("অনুগ্রহ করে আপনার ইমেইল লিখুন");
      return;
    }
    const validEmail = /\S+@\S+\.\S+/.test(email);
    if (!validEmail) {
      toast.error("অনুগ্রহ করে সঠিক ইমেইল লিখুন");
      return;
    }
// console.log(email.trim());
    try {
      setSubmitting(true);
      const res = await requestPasswordReset(email.trim());
      if (res.success) {
        toast.success(
          res.message ||
            "যদি এই ইমেইলটি রেজিস্টার্ড থাকে, তাহলে reset link পাঠানো হয়েছে।",
        );
      } else {
        toast.error(
          res.message ||
            "Password reset link পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন।",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white flex items-center">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="max-w-md mx-auto rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 pt-6 text-center">
              <div className="inline-block mb-3">
                <span className="text-xs font-bold tracking-widest text-white px-4 py-2 rounded-full bg-primary">
                  পাসওয়ার্ড রিসেট
                </span>
              </div>
              <h2 className="text-2xl font-black text-primary">
                Password ভুলে গেছেন?
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                আপনার একাউন্টের ইমেইল লিখুন। আমরা একটি পাসওয়ার্ড রিসেট লিংক পাঠাবো।
              </p>
            </div>

            <div className="p-6 border-t border-gray-100">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FiMail />
                  </span>
                  <input
                    type="email"
                    placeholder="আপনার ইমেইল"
                    className="w-full rounded-md border border-gray-300 bg-transparent py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary p-2.5 rounded text-white w-full hover:bg-primary/90 disabled:opacity-50 font-semibold text-sm"
                >
                  {submitting ? "অনুরোধ পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm">
                <span>মনে পড়ে গেছে?</span>
                <Link href="/login" className="text-primary font-semibold">
                  লগইন পেইজে ফিরে যান
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

