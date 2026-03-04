"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { resetPasswordWithToken } from "../../lib/api-services";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const userId = searchParams.get("id") || "";
  const token = searchParams.get("token") || "";
  const type = (searchParams.get("type") as "customer" | "system" | null) || undefined;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      !!userId &&
      !!token &&
      password.length >= 6 &&
      confirmPassword.length >= 6
    );
  }, [submitting, userId, token, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !token) {
      toast.error("Reset link invalid. আবার forgot password দিন।");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("পাসওয়ার্ড দুইবার একই লিখুন");
      return;
    }

    try {
      setSubmitting(true);
      const res = await resetPasswordWithToken({
        userId,
        token,
        password,
        confirmPassword,
        type: type === "customer" ? "customer" : "system",
      });

      if (res.success) {
        toast.success(res.message || "Password reset successful. এখন লগইন করুন।");
        // ছোট্ট ডিলে দিয়ে লগইন পেইজে পাঠানো হবে
        setTimeout(() => {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(pathname || "/my-account/dashboard")}`,
          );
        }, 800);
      } else {
        toast.error(res.message || "Password reset failed. আবার চেষ্টা করুন।");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const missingParams = !userId || !token;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white flex items-center">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-5 py-10">
          <div className="max-w-md mx-auto rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 pt-6 text-center">
              <div className="inline-block mb-3">
                <span className="text-xs font-bold tracking-widest text-white px-4 py-2 rounded-full bg-primary">
                  নতুন পাসওয়ার্ড
                </span>
              </div>
              <h2 className="text-2xl font-black text-primary">Reset Password</h2>
              <p className="text-sm text-gray-600 mt-2">
                আপনার নতুন পাসওয়ার্ড সেট করুন।
              </p>
            </div>

            <div className="p-6 border-t border-gray-100">
              {missingParams ? (
                <div className="text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded px-3 py-3">
                  Reset link invalid বা incomplete.
                  <div className="mt-2">
                    <Link href="/forgot-password" className="text-primary font-semibold">
                      Forgot password পেইজে যান
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <FiLock />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="নতুন পাসওয়ার্ড"
                      className="w-full rounded-md border border-gray-300 bg-transparent py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <FiLock />
                    </span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="পাসওয়ার্ড আবার লিখুন"
                      className="w-full rounded-md border border-gray-300 bg-transparent py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="bg-primary p-2.5 rounded text-white w-full hover:bg-primary/90 disabled:opacity-50 font-semibold text-sm"
                  >
                    {submitting ? "সেট করা হচ্ছে..." : "পাসওয়ার্ড সেট করুন"}
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-2 mt-4 text-sm">
                <span>লগইন করতে চান?</span>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`}
                  className="text-primary font-semibold"
                >
                  লগইন
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
          লোড হচ্ছে...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}


