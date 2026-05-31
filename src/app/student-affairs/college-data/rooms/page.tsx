"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Pencil, Trash2, X, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROOM_TYPES = [
  { id: 1, name: "LectureHall", label: "Lecture Hall" },
  { id: 2, name: "ClassRoom", label: "Class Room" },
  { id: 3, name: "ComputerLab", label: "Computer Lab" },
  { id: 4, name: "ScientificLab", label: "Scientific Lab" },
  { id: 5, name: "Workshop", label: "Workshop" },
  { id: 6, name: "Studio", label: "Studio" },
  { id: 7, name: "Clinic", label: "Clinic" },
  { id: 8, name: "LanguageLab", label: "Language Lab" },
  { id: 9, name: "DrawingRoom", label: "Drawing Room" },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    roomNumber: "",
    type: "",
  });

   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  // ================= Fetch Buildings =================
  const fetchBuildings = async () => {
    try {
      const res = await axiosInstance.get(`/buildings?PageNumber=1&PageSize=100`);
      setBuildings(res.data?.items || []);
      setErrorMessage("");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch buildings.";
      setErrorMessage(message);
    }
  };

  // ================= Fetch Rooms =================
  const fetchRooms = useCallback(async () => {
    if (!selectedBuildingId) {
      setRooms([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        `/buildings/${selectedBuildingId}/rooms?PageNumber=${pageNumber}&PageSize=${pageSize}${
          debouncedSearch ? `&SearchValue=${debouncedSearch}` : ""
        }`
      );

      setRooms(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to fetch rooms.";
      setErrorMessage(message);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBuildingId, pageNumber, pageSize, debouncedSearch]);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ================= Handle Search Input =================
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setPageNumber(1);            
  };

  // ================= Handle Input =================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= Reset =================
  const resetForm = () => {
    setEditingId(null);
    setErrorMessage("");
    setFormData({
      name: "",
      capacity: "",
      roomNumber: "",
      type: "",
    });
  };

  // ================= Submit =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      formData.name.trim() === "" ||
      formData.capacity === "" ||
      formData.roomNumber.trim() === "" ||
      formData.type === "" ||
      selectedBuildingId === ""
    ) {
      setErrorMessage("Please fill all fields.");
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: editingId,
      name: formData.name.trim(),
      capacity: Number(formData.capacity),
      roomNumber: Number(formData.roomNumber),
      roomType: Number(formData.type),
    };

    try {
      if (editingId) {
        await axiosInstance.put(
          `/buildings/${selectedBuildingId}/rooms/${editingId}`,
          payload
        );
      } else {
        await axiosInstance.post(
          `/buildings/${selectedBuildingId}/rooms`,
          payload
        );
      }

      resetForm();
      fetchRooms();
    } catch (err: any) {
      const data = err?.response?.data;
      let message = "Failed to save room data.";
      if (data) {
        if (data.errors && typeof data.errors === "object") {
          const errorParts = Object.entries(data.errors).map(([key, value]) => {
            const text = Array.isArray(value) ? value.join("; ") : String(value);
            return `${key}: ${text}`;
          });
          message = errorParts.join("\n") || message;
        } else if (data.message) {
          message = data.message;
        } else if (data.title) {
          message = data.title;
        }
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (room: any) => {
    setEditingId(room.id);
    const roomTypeValue = room.roomType ?? room.type;

    const matchedRoomType = ROOM_TYPES.find(
      (t) =>
        String(t.id) === String(roomTypeValue) ||
        String(t.name) === String(roomTypeValue)
    );

    setFormData({
      name: room.name || "",
      capacity: String(room.capacity || ""),
      roomNumber: String(room.roomNumber || ""),
      type: matchedRoomType ? String(matchedRoomType.id) : "",
    });

    setSelectedBuildingId(
      String(room.buildingId ?? room.building?.id ?? selectedBuildingId ?? "")
    );

    setTimeout(() => {
      topRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  // ================= Delete =================
  const handleDelete = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;
    if (!selectedBuildingId) return;

    try {
      await axiosInstance.delete(
        `/buildings/${selectedBuildingId}/rooms/${roomId}`
      );
      fetchRooms();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to delete room.";
      setErrorMessage(message);
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto";
  const labelCls = "text-[13px] font-bold text-gray-900 ml-1";

  return (
    <div ref={topRef} className="w-full h-full flex flex-col gap-6 font-inter pb-8 scroll-mt-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage("")} className="cursor-pointer opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Form Card ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0 print:hidden">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Edit Room" : "Adding Rooms"}
          </h1>
          {editingId && (
            <button 
              type="button" 
              onClick={resetForm} 
              className="text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold h-8 px-3 cursor-pointer flex items-center transition-colors gap-1"
            >
              <X size={14} className="mr-1" /> <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className={labelCls}>Name</label>
              <input
                name="name"
                placeholder="Ex: Main Hall"
                value={formData.name}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className={labelCls}>Capacity</label>
              <input
                name="capacity"
                type="number"
                placeholder="Ex: 120"
                value={formData.capacity}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className={labelCls}>Room Number</label>
              <input
                name="roomNumber"
                placeholder="Ex: 101"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className={labelCls}>Room Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={cn(inputCls, "cursor-pointer")}
              >
                <option value="">Select Room Type</option>
                {ROOM_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className={labelCls}>Building</label>
              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                disabled={!!editingId}
                className={cn(
                  inputCls, 
                  "cursor-pointer",
                  editingId && "bg-gray-50 text-gray-400 cursor-not-allowed"
                )}
              >
                <option value="">Select Building</option>
                {buildings.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer flex items-center justify-center text-sm active:scale-[0.99]",
              editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* ── List Card ── */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Rooms</h2>
            <Badge className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100 hover:bg-[#eff4ff] shadow-none">
              {rooms.length} Rooms
            </Badge>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room name or number"
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl gap-4">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[13px] font-bold text-gray-800 w-1/4">Name</span>
            <span className="text-[13px] font-bold text-gray-800 w-1/4 text-center">Capacity</span>
            <span className="text-[13px] font-bold text-gray-800 w-1/4 text-center">Room Number</span>
            <span className="text-[13px] font-bold text-gray-800 w-1/4 text-center">Room Type</span>
          </div>
          <div className="w-[80px]"></div>
        </div>

        {/* Rows Container */}
        <div className="flex flex-col gap-3 mb-8">
          {isLoading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-blue-600" /> Loading...
            </div>
          ) : !selectedBuildingId ? (
            <div className="text-center p-8 text-blue-500 bg-amber-50/50 border border-amber-100 rounded-xl border-dashed font-medium text-sm">
              Please select a building from above to display its rooms.
            </div>
          ) : rooms.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No rooms found for this building.
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room.id}
                className={cn(
                  "flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white gap-3 sm:gap-4 relative group",
                  editingId === room.id && "bg-blue-50/50 border-blue-200"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                  <div className="w-full sm:w-1/4 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Name</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate">{room.name}</span>
                  </div>

                  <div className="w-full sm:w-1/4 sm:text-center truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Capacity</span>
                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900 truncate">{room.capacity}</span>
                  </div>

                  <div className="w-full sm:w-1/4 sm:text-center truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Room Number</span>
                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900 truncate">{room.roomNumber}</span>
                  </div>

                  <div className="w-full sm:w-1/4 sm:text-center truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Room Type</span>
                    <span className="text-[14px] font-bold text-gray-500 sm:text-gray-900 truncate">
                      {ROOM_TYPES.find(
                        (t) =>
                          String(t.id) === String(room.roomType || room.type) ||
                          String(t.name) === String(room.roomType || room.type)
                      )?.label || "—"}
                    </span>
                  </div>
                </div>

                {/* Actions Container */}
                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto print:hidden">
                  <button
                    type="button"
                    onClick={() => handleEdit(room)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(room.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-2 print:hidden">
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