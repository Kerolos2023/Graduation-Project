"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ExamCommitteeTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const [currentId, setCurrentId] = useState<string>("");

  useEffect(() => {
    if (params.id) {
      setCurrentId(params.id as string);
    }
  }, [params.id]);

  if (pathname.includes('/commites/exams')) {
    return null;
  }

  const tabs = [
    {
      id: 'committee',
      label: 'Committees',
      path: `/student-affairs/commites/committee/${currentId || params.id || ''}`
    },
    {
      id: 'courses',
      label: 'Courses',
      path: '/student-affairs/commites/courses'
    },
  ];

  return (
    <div className="w-full bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-8" dir="ltr">
      <div className="flex flex-wrap items-center gap-3">
        {tabs.map((tab) => {
          const isActive = pathname.includes(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => {

                if (tab.id === 'committee' && !currentId && !params.id) {
                  router.push('/student-affairs/commites/exams');
                } else {
                  router.push(tab.path);
                }
              }}
              className={`
                px-8 py-3 text-[15px] font-bold rounded-2xl transition-all duration-300 cursor-pointer
                ${isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'bg-[#F8FAFC] text-slate-400 hover:bg-gray-100 hover:text-slate-600'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}