import { useEffect, useRef } from "react";

interface ReturnPoliciesProps {
  content?: string;
}

const ReturnPolicies = ({ content }: ReturnPoliciesProps) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!content || !contentRef.current) return;
    const root = contentRef.current;
    const tables = root.querySelectorAll("table");
    tables.forEach((table) => {
      table.classList.add("w-full", "border", "border-gray-300");
      (table as HTMLTableElement).style.borderCollapse = "collapse";
      const cells = table.querySelectorAll("th, td");
      cells.forEach((cell) => {
        (cell as HTMLElement).classList.add("border", "border-gray-300", "p-2");
      });
    });
    const uls = root.querySelectorAll("ul");
    uls.forEach((ul) => {
      (ul as HTMLElement).classList.add("list-disc", "list-inside", "ml-4");
    });
    const ols = root.querySelectorAll("ol");
    ols.forEach((ol) => {
      (ol as HTMLElement).classList.add("list-decimal", "list-inside", "ml-4");
    });
    const bolds = root.querySelectorAll("b, strong");
    bolds.forEach((b) => {
      (b as HTMLElement).classList.add("font-bold");
    });
    const italics = root.querySelectorAll("i, em");
    italics.forEach((i) => {
      (i as HTMLElement).classList.add("italic");
    });
  }, [content]);

  if (!content) {
    return (
      <div className="text-gray-600 text-sm">
        রিটার্ন নীতিমালা সংক্রান্ত তথ্য এখনই উপলব্ধ নয়।
      </div>
    );
  }

  return (
    <div className="prose max-w-none prose-sm sm:prose-base">
      <div ref={contentRef} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

export default ReturnPolicies;
