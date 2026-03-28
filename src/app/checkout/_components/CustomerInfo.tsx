"use client";

import { IoCartOutline } from "react-icons/io5";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiCreditCard,
  FiHome,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FieldTitle = ({ Icon, title }: { Icon: IconType; title: string }) => {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
      <Icon size={14} className="text-gray-500" />
      <span>{title}</span>
    </div>
  );
};

interface CustomerInfoProps {
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  district?: string;
  setDistrict?: (v: string) => void;
  upazila?: string;
  setUpazila?: (v: string) => void;
  deliveryType?: "inside" | "outside" | "";
  setDeliveryType?: (v: "inside" | "outside" | "") => void;
  paymentMethod?: "cod" | "prepaid";
  setPaymentMethod?: (v: "cod" | "prepaid") => void;
  onSubmit: () => void;
  submitting?: boolean;
}

const CustomerInfo = ({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  district,
  setDistrict,
  upazila,
  setUpazila,
  deliveryType,
  setDeliveryType,
  paymentMethod,
  setPaymentMethod,
  onSubmit,
  submitting,
}: CustomerInfoProps) => {
  const [districtList, setDistrictList] = useState<
    Array<{ id?: number; জেলার_নাম: string; উপজেলা_সমূহ: string[] }>
  >([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const candidates = [
        "/images/zila.json",
        "/images/zlia.json",
        "/zila.json",
        "/zlia.json",
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = (await res.json()) as any;
          const list = Array.isArray(json?.জেলা_সমূহ) ? json.জেলা_সমূহ : [];
          const normalized = list
            .map((d: any) => ({
              id: typeof d?.id === "number" ? d.id : undefined,
              জেলার_নাম: String(d?.জেলার_নাম || d?.জেলা || "").trim(),
              উপজেলা_সমূহ: Array.isArray(d?.উপজেলা_সমূহ)
                ? d.উপজেলা_সমূহ
                    .map((u: any) => String(u).trim())
                    .filter(Boolean)
                : Array.isArray(d?.উপজেলা)
                  ? d.উপজেলা.map((u: any) => String(u).trim()).filter(Boolean)
                  : [],
            }))
            .filter((d: any) => d.জেলার_নাম);
          if (mounted && normalized.length) {
            setDistrictList(normalized);
            return;
          }
        } catch {
          continue;
        }
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedDistrict = useMemo(() => {
    const name = (district || "").trim();
    if (!name) return null;
    return districtList.find((d) => d.জেলার_নাম === name) || null;
  }, [district, districtList]);

  const upazilaOptions = useMemo(() => {
    return selectedDistrict?.উপজেলা_সমূহ || [];
  }, [selectedDistrict]);

  return (
    <section>
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        {/* customer info start */}
        <div className="flex flex-col gap-3  border border-gray-100 bg-white p-4 shadow-sm rounded-lg">
          <h1 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            কাস্টমার তথ্য
          </h1>
          <div className="flex flex-col gap-3">
            <div className="grid min-[550px]:grid-cols-2 grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiMail} title="ইমেইল (Optional)" />
                <input
                  className="border border-gray-200 outline-none  py-2.5 px-3 text-sm focus:border-black placeholder:text-gray-400 bg-gray-50/30 focus:bg-white transition-all rounded-lg"
                  type="email"
                  placeholder="ইমেইল"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiUser} title="সম্পূর্ণ নাম *" />
                <input
                  className="border border-gray-200 outline-none  py-2.5 px-3 text-sm focus:border-black placeholder:text-gray-400 bg-gray-50/30 focus:bg-white transition-all rounded-lg"
                  type="text"
                  placeholder="সম্পূর্ণ নাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid min-[550px]:grid-cols-2 grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiMapPin} title="জেলা *" />
                {districtList.length ? (
                  <Select
                    value={district || ""}
                    onValueChange={(value) => {
                      setDistrict?.(value);
                      setUpazila?.("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="জেলার_নাম নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>District</SelectLabel>
                        {districtList.map((d) => (
                          <SelectItem key={d.জেলার_নাম} value={d.জেলার_নাম}>
                            {d.জেলার_নাম}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    className="border border-gray-200 outline-none  py-2.5 px-3 text-sm focus:border-black placeholder:text-gray-400 bg-gray-50/30 focus:bg-white transition-all rounded-lg"
                    type="text"
                    placeholder="জেলার নাম"
                    value={district || ""}
                    onChange={(e) => setDistrict?.(e.target.value)}
                    required
                  />
                )}
              </div>

              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiMapPin} title="উপজেলা *" />
                {districtList.length ? (
                  <Select
                    value={upazila || ""}
                    onValueChange={(value) => setUpazila?.(value)}
                    disabled={!selectedDistrict}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="উপজেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Upazila</SelectLabel>
                        {upazilaOptions.map((u) => (
                          <SelectItem key={u} value={u}>
                            {u}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    className="border border-gray-200 outline-none  py-2.5 px-3 text-sm focus:border-black placeholder:text-gray-400 bg-gray-50/30 focus:bg-white transition-all rounded-lg"
                    type="text"
                    placeholder="উপজেলা"
                    value={upazila || ""}
                    onChange={(e) => setUpazila?.(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1">
              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiHome} title="বিস্তারিত ঠিকানা *" />
                <input
                  className="border border-gray-200 outline-none  py-2.5 px-3 text-sm focus:border-black placeholder:text-gray-400 bg-gray-50/30 focus:bg-white transition-all rounded-lg"
                  type="text"
                  placeholder="বিস্তারিত ঠিকানা"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1">
              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiPhone} title="ফোন নম্বর *" />
                <input
                  className="border border-gray-200 outline-none  py-2.5 px-3 text-sm focus:border-black placeholder:text-gray-400 bg-gray-50/30 focus:bg-white transition-all rounded-lg"
                  type="tel"
                  inputMode="numeric"
                  placeholder="ফোন নম্বর"
                  value={phone}
                  onChange={(e) => {
                    const onlyDigits = e.target.value.replace(/\D/g, "");
                    setPhone(onlyDigits);
                  }}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        {/* customer info end  */}

        {/* delivery type & payment method */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-3 border border-gray-100 bg-white p-4 shadow-sm rounded-lg">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              ডেলিভারি টাইপ
            </h2>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <FieldTitle Icon={FiTruck} title="ডেলিভারি টাইপ *" />
                <Select
                  value={deliveryType || ""}
                  onValueChange={(value) =>
                    setDeliveryType?.(value as "inside" | "outside")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="ডেলিভারি টাইপ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Delivery</SelectLabel>
                      <SelectItem value="inside">ঢাকার ভিতরে (60৳)</SelectItem>
                      <SelectItem value="outside">
                        ঢাকার বাইরে (120৳)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3  border border-gray-100 bg-white p-4 shadow-sm rounded-lg">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
              পেমেন্ট পদ্ধতি
            </h2>
            <div className="flex flex-col gap-2">
              <FieldTitle Icon={FiCreditCard} title="পেমেন্ট মেথড *" />
              <label
                className={`flex items-center gap-3 p-3  border cursor-pointer transition-all rounded-lg ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod?.("cod")}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-medium">ক্যাশ অন ডেলিভারি</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-black hover:bg-gray-900 transition-all text-white text-sm font-bold py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-black/10 hover:shadow-lg hover:-translate-y-0.5 mt-2 !rounded-full"
        >
          <IoCartOutline size={18} />
          {submitting ? "অর্ডার হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
        </button>
      </form>
    </section>
  );
};

export default CustomerInfo;
