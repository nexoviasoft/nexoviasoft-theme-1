"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiAlertCircle, FiHome, FiRefreshCw } from "react-icons/fi";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex justify-center">
          <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
            <FiAlertCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            কিছু ভুল হয়েছে!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            দুঃখিত, সার্ভারে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন অথবা কিছুক্ষণ পর ফিরে আসুন।
          </p>
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-red-600 border border-red-100">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-900 transition-all shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
          >
            <FiRefreshCw className="w-4 h-4" />
            আবার চেষ্টা করুন
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 text-sm font-bold rounded-xl hover:bg-gray-50 hover:text-black transition-all hover:border-gray-300"
          >
            <FiHome className="w-4 h-4" />
            হোম পেজ
          </Link>
        </div>
      </div>
    </div>
  );
}
