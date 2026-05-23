"use client";

import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { COLLEGE_ID } from "@/lib/constants";

const API = `/colleges/${COLLEGE_ID}/service-requests/history`;

export default function ServiceRequestsPage() {
  const [data, setData] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `${API}?pageNumber=${pageNumber}&pageSize=${pageSize}${
          search ? `&status=${search}` : ""
        }`);

      setData(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Ready":
        return "bg-green-100 text-green-600";
      case "Pending":
        return "bg-yellow-100 text-yellow-600";
      case "Rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  return (
    <div className="w-full p-4 md:p-6 bg-[#f7f8fa]">
      <div className="bg-white rounded-[20px] border p-4 md:p-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg md:text-xl font-bold">
              Services Requests
            </h1>

            <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
              {data.length} Items
            </span>
          </div>

          <input
            placeholder="Search by Status"
            value={search}
            onChange={(e) => {
              setPageNumber(1);
              setSearch(e.target.value);
            }}
            className="w-full md:w-[220px] px-4 py-2 border rounded-[12px] text-sm focus:outline-none"
          />
        </div>

        <div className="hidden md:block">

          <div className="grid grid-cols-5 px-5 py-3 mb-3 text-xs text-gray-400 font-semibold">
            <span>Student</span>
            <span>Service</span>
            <span>Request Time</span>
            <span>Updated Time</span>
            <span className="text-right">Status</span>
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
              data.map((item, index) => (
                <div
                  key={index}
                  className="
                    grid 
                    grid-cols-5 
                    gap-3 
                    px-4 md:px-5 
                    py-4 
                    border 
                    rounded-[16px] 
                    bg-white
                  "
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {item.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.studentCode}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {item.serviceName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.price} EGP
                    </p>
                  </div>

                  {/* Request */}
                  <div className="text-xs font-medium">
                    {formatDate(item.createdAt)}
                  </div>

                  {/* Updated */}
                  <div className="text-xs font-medium">
                    {formatDate(item.updatedAt)}
                  </div>

                  {/* Status */}
                  <div className="flex justify-center md:justify-end items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-8 md:hidden">

          {isLoading && (
            <div className="text-center py-6">Loading...</div>
          )}

          {!isLoading && data.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              No data found
            </div>
          )}

          {!isLoading &&
            data.map((item, index) => (
              <div
                key={index}
                className="
                  border
                  rounded-[18px]
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-sm">
                      {item.studentName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.studentCode}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium">
                    {item.serviceName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.price} EGP
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-400 text-[11px]">
                      Request
                    </p>
                    <p className="font-medium">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-gray-400 text-[11px]">
                      Updated
                    </p>
                    <p className="font-medium">
                      {formatDate(item.updatedAt)}
                    </p>
                  </div>
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