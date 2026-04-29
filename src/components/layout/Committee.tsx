"use client";

import { useRouter, usePathname } from "next/navigation";

export default function ExamCommitteeTabs() {
  const router = useRouter();
  const pathname = usePathname();

   const tabs = [
    { 
      id: 'committees', 
      label: 'Committees', 
      path: '/student-affairs/commites/committee' 
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
           const isActive = pathname.startsWith(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
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