"use client";

import { usePathname } from "next/navigation";
import ExamCommitteeTabs from "@/components/layout/Committee";

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

   const isExamsPage = pathname.includes("/exams");

  return (
    <div className="flex flex-col gap-4">
       
      {!isExamsPage && <ExamCommitteeTabs />}

      <div className="w-full">
        {children}
      </div>
    </div>
  );
}