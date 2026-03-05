"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { API_CONFIG } from "../../../lib/api-config";
import { initialSetPasswordForGuest } from "../../../lib/api-services";
import { useAuth } from "../../../context/AuthContext";

const CompleteSignupClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const emailFromQuery = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const orderIdFromQuery = useMemo(() => {
    const v = searchParams.get("orderId");
    return v ? Number(v) : undefined;
  }, [searchParams]);

  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      const res = await initialSetPasswordForGuest({
        email,
        password,
        confirmPassword,
        orderId: orderIdFromQuery,
        companyId: API_CONFIG.companyId,
      });
      if (!res?.success) {
        toast.error(res?.message || "Failed to set password");
        return;
      }
      const loginRes = await login(email, password);
      if (!loginRes.success) {
        toast.error(loginRes.error || "Login failed");
        return;
      }
      toast.success("Account created. Redirecting to dashboard...");
      router.push("/my-account/orders");
    } catch (err) {
      console.error(err);
      toast.error("Failed to complete signup");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold tracking-widest text-primary uppercase leading-tight">
            Complete Signup
          </p>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">Create your password</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-[1.5px] border-gray-300 outline-none rounded-[8px] py-2.5 px-3 text-sm focus:border-black disabled:bg-gray-100"
              placeholder="you@example.com"
              readOnly={!!emailFromQuery}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-[1.5px] border-gray-300 outline-none rounded-[8px] py-2.5 px-3 text-sm focus:border-black"
              placeholder="Create a password"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-[1.5px] border-gray-300 outline-none rounded-[8px] py-2.5 px-3 text-sm focus:border-black"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 transition-colors text-white text-base py-2.5 font-medium rounded-full disabled:opacity-70"
          >
            {submitting ? "Creating..." : "Create password & Go to dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteSignupClient;
