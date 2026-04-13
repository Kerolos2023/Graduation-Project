"use client";

import { useRouter, usePathname } from "next/navigation";

export default function CollegeDataTabs() {
  const router = useRouter();
  const pathname = usePathname();

   
  const tabs = [
    { id: 'departments', label: 'Department Data', path: '/student-affairs/college-data/departments-data/department-data' },
    { id: 'semesters', label: 'Semesters', path: '/student-affairs/college-data/departments-data/levels' },
    { id: 'grades', label: 'Grades', path: '/student-affairs/college-data/departments-data/grades' },
    { id: 'levels', label: 'Credit Load by Level', path: '/student-affairs/college-data/departments-data/credit' },
    { id: 'courses', label: 'Department Courses', path: '/student-affairs/college-data/departments-data/department-course' },
  ];

  return (
    <div className="w-full bg-[#FFFFFF] p-4 rounded-3xl border border-gray-200 shadow-sm mb-6" dir="ltr">
      <div className="flex flex-wrap items-center gap-3 p-1.5 bg-white rounded-4xl w-fit">
        {tabs.map((tab) => {
           
          const isActive = pathname === tab.path;

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}    
              className={`
                px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer
                ${isActive 
                  ? 'bg-[#EBF2FF] text-[#2563EB] shadow-sm'  
                  : 'text-[#1D2433A6] hover:text-neutral-900 hover:bg-gray-200/50'  
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