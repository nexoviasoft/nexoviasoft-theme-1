"use client";

import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import toast from "react-hot-toast";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: number;
}

export default function CopyButton({
  text,
  label = "কপি করুন",
  className = "",
  size = 16,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text?.trim()) return;
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
      toast.success("ট্র্যাকিং আইডি কপি হয়েছে");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("কপি করা যায়নি");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 transition-colors ${className}`}
    >
      <FiCopy size={size} className={copied ? "text-black" : ""} />
      <span>{copied ? "কপি হয়েছে" : label}</span>
    </button>
  );
}
