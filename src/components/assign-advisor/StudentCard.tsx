import React from "react";
import { cn } from "@/lib/utils";
import { type StudentItem } from "@/services/advisorServices";

export interface StudentCardProps {
  student: StudentItem;
  selected: boolean;
  onToggle: (id: string) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({ student, selected, onToggle }) => (
  <div
    role="checkbox"
    aria-checked={selected}
    tabIndex={0}
    onClick={() => onToggle(student.id)}
    onKeyDown={(e) => e.key === " " && onToggle(student.id)}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-[12px] border cursor-pointer transition-all duration-150 select-none group",
      selected
        ? "bg-blue-50 border-blue-300 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]"
        : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
    )}
  >
    {/* Custom checkbox */}
    <div className={cn(
      "w-4 h-4 rounded-[4px] border-2 flex items-center justify-center shrink-0 transition-colors",
      selected ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
    )}>
      {selected && (
        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5">
          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>

    {/* Avatar */}
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center shrink-0">
      <span className="text-white text-[11px] font-bold">
        {student.name?.charAt(0)?.toUpperCase() ?? "?"}
      </span>
    </div>

    {/* Info */}
    <div className="flex flex-col min-w-0 flex-1">
      <span className="text-[13px] font-semibold text-gray-900 truncate">{student.name}</span>
      <span className="text-[11px] text-gray-400">{student.studentCode}</span>
    </div>
  </div>
);
