"use client";

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { COLLEGE_ID } from "@/lib/constants";


export default function ServiceRequestsPage() {
  const [data, setData] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(`/colleges/${COLLEGE_ID}/service-requests`, {
        params: {
          pageNumber,
          pageSize,
        },
      });

      setData(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAccept = async (id: string) => {
    try {
      await axiosInstance.patch(`/colleges/${COLLEGE_ID}/service-requests/${id}/accept`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axiosInstance.patch(`/colleges/${COLLEGE_ID}/service-requests/${id}/reject`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString() : "-";

  return (
    <div className="w-full p-4 md:p-6 bg-[#f7f8fa]">
      <div className="bg-white rounded-[20px] border p-4 md:p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold">Service Requests</h1>
            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
              {data.length} Items
            </span>
          </div>
        </div>

        {/* ================= DESKTOP ================= */}
        <div className="hidden md:block">

          <div className="grid grid-cols-5 gap-3 px-4 py-2 mb-2 text-xs text-gray-400 font-semibold">
            <span>Student</span>
            <span>Service</span>
            <span>Date</span>
            <span>Price</span>
            <span className="text-center">Actions</span>
          </div>

          <div className="flex flex-col gap-3 mb-8">

            {isLoading && (
              <div className="text-center py-6">Loading...</div>
            )}

            {!isLoading && data.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                No data found
              </div>
            )}

            {!isLoading &&
              data.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-5 gap-3 items-center px-4 py-4 border rounded-[16px] bg-white"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {item.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.studentCode}
                    </p>
                  </div>

                  <div className="text-sm">
                    {item.serviceName}
                  </div>

                  <div className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </div>

                  <div className="text-sm font-medium">
                    {item.price} EGP
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleAccept(item.id)}
                      className="bg-blue-600 text-white text-xs px-4 py-2 rounded-full hover:bg-blue-700 transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => handleReject(item.id)}
                      className="text-red-500 border border-red-200 text-xs px-4 py-2 rounded-full hover:bg-red-100 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ================= MOBILE ================= */}
        <div className="md:hidden flex flex-col gap-3 mb-8">

          {isLoading && (
            <div className="text-center py-6">Loading...</div>
          )}

          {!isLoading && data.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No data found
            </div>
          )}

          {!isLoading &&
            data.map((item) => (
              <div
                key={item.id}
                className="border rounded-2xl bg-white p-4 shadow-sm"
              >
                {/* Row 1: Student + Date */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {item.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.studentCode}
                    </p>
                  </div>

                  <p className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                {/* Row 2: Service */}
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Service
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {item.serviceName}
                  </p>
                </div>

                {/* Row 3: Price */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">
                    Price
                  </p>
                  <p className="text-base font-semibold">
                    {item.price} EGP
                  </p>
                </div>

                {/* Row 4: Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAccept(item.id)}
                    className="flex-1 bg-blue-600 text-white text-sm py-2.5 rounded-xl hover:bg-blue-700 transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex-1 border border-red-200 text-red-500 text-sm py-2.5 rounded-xl hover:bg-red-50 transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={pageNumber}
              totalPages={totalPages}
              onPageChange={setPageNumber}
            />
          </div>
        )}

      </div>
    </div>
  );
}