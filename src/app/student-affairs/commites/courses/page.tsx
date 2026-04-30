"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Pencil, Loader2 } from "lucide-react";
import { getAllCourses } from '@/services/coursesServices';
 

export default function CoursesPage() {
  const router = useRouter();
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCourses().then(setAllCourses).finally(() => setLoading(false));
  }, []);

   const filteredCourses = useMemo(() => {
    return allCourses.filter((c: any) => 
      c.couresName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.couresCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allCourses]);

  return (
    <div className="p-4 md:p-8 bg-[#F9F9F9] min-h-screen font-sans">
       <Card className="p-4 md:p-10 max-w-7xl mx-auto shadow-sm border-[#E5E7EB] rounded-[1.5rem] bg-white">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A0D12]">Courses</h1>
            <Badge className="bg-[#EBF5FF] text-[#2463F0] hover:bg-[#EBF5FF] rounded-full px-4 py-1 font-semibold border-none">
              {loading ? "..." : `${filteredCourses.length} Courses`}
            </Badge>
          </div>
          
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search" 
              className="pl-12 h-12 rounded-xl bg-white border-[#E5E7EB] focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>

         <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_0.5fr] px-6 py-6 bg-[#FDFDFD] border border-[#F1F1F1] rounded-xl mb-4 text-[14px] font-medium text-[#181D27]">
          <div>Name</div>
          <div>Code</div>
          <div>Number of registered students</div>
          <div className="text-right">Action</div>
        </div>

         <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            filteredCourses.map((course: any) => (
              <Card 
                key={course.id} 
                className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1.5fr_0.5fr] items-center px-6 py-5 border-[#F1F1F1] rounded-xl hover:shadow-sm transition-all gap-4 md:gap-0"
              >
                 <div className="font-semibold text-[#111827]">
                  <span className="md:hidden text-xs text-gray-500 block">Name:</span>
                  {course.couresName}
                </div>
                <div className="text-[#181D27]">
                  <span className="md:hidden text-xs text-gray-500 block">Code:</span>
                  {course.couresCode}
                </div>
                <div className="text-[#181D27]">
                  <span className="md:hidden text-xs text-gray-500 block">Students:</span>
                  {course.numberOfStudents}
                </div>
                <div className="flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-gray-50 text-blue-400"
                    onClick={() => router.push(`/courses/edit/${course.id}`)}
                  >
                    <Pencil className="h-6 w-6 rotate-90" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

         {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20 text-gray-400">No results found for "{searchQuery}"</div>
        )}

      </Card>
    </div>
  );
}