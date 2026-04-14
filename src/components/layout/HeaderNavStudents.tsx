"use client";

import { cn } from "@/lib/utils";
import { useStudentContext } from "@/hooks/useStudentContext";

export const HeaderNavigation = () => {
  const { activeTab, setActiveTab } = useStudentContext();

  const navLinks = [
    { label: "Personal Data", key: "personal" },
    { label: "Parent Data", key: "parent" },
    { label: "Contact Information", key: "contact" },
    { label: "Military Data", key: "military" },
    { label: "Qualification Data", key: "qualification" },
  ];

  return (
    <div className="w-full flex gap-2 p-3 bg-white rounded-2xl border">
      {navLinks.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveTab(item.key as any)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-semibold",
            activeTab === item.key
              ? "bg-blue-100 text-blue-600"
              : "text-gray-500 hover:bg-gray-100"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};