"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Pencil, Trash2, Printer } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";

const BUILDING_API = "/Building";

const ROOM_TYPES = [
  { value: 1, label: "Lecture Hall" },
  { value: 2, label: "Class Room" },
  { value: 3, label: "Computer Lab" },
  { value: 4, label: "Scientific Lab" },
  { value: 5, label: "Workshop" },
  { value: 6, label: "Studio" },
  { value: 7, label: "Clinic" },
  { value: 8, label: "Language Lab" },
  { value: 9, label: "Drawing Room" },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);

  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    roomNumber: "",
    roomTypeId: "",
  });

  // ================= Fetch Rooms =================
  const fetchRooms = useCallback(async () => {
    if (!selectedBuildingId) return;

    setIsLoading(true);

    try {
      const url = `/buildings/${selectedBuildingId}/rooms/all?PageNumber=${pageNumber}&PageSize=${pageSize}${
        searchValue ? `&SearchValue=${searchValue}` : ""
      }`;

      const res = await axiosInstance.get(url);

      setRooms(res.data?.items || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching rooms:", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBuildingId, pageNumber, pageSize, searchValue]);

  // ================= Fetch Buildings =================
  const fetchBuildings = async () => {
    try {
      const res = await axiosInstance.get(`buildings?PageNumber=${pageNumber}&PageSize=${pageSize}${
        searchValue ? `&SearchValue=${searchValue}` : ""
      }`);
      setBuildings(res.data?.items || []);
    } catch (err) {
      console.error("Error fetching buildings:", err);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

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

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      name: "",
      capacity: "",
      roomNumber: "",
      roomTypeId: "",
    });

    setSelectedBuildingId("");
  };

  // ================= Submit =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.capacity ||
      !formData.roomNumber ||
      !formData.roomTypeId ||
      !selectedBuildingId
    ) {
      alert("Please fill all fields.");
      return;
    }

    const payload = {
      name: formData.name,
      capacity: Number(formData.capacity),
      roomNumber: formData.roomNumber,
      roomTypeId: Number(formData.roomTypeId),
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
    } catch (err) {
      console.error("Error saving room:", err);
    }
  };

  // ================= Edit =================
  const handleEdit = (room: any) => {
    setEditingId(room.id);

    setFormData({
      name: room.name,
      capacity: String(room.capacity),
      roomNumber: room.roomNumber,
      roomTypeId: String(room.roomTypeId),
    });

    setSelectedBuildingId(room.buildingId || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
    } catch (err) {
      console.error("Error deleting room:", err);
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="w-full flex flex-col gap-6 pb-8 font-inter">
      {/* ================= FORM ================= */}
      <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0] print:hidden">
        <h1 className="text-xl font-bold mb-6">
          {editingId ? "Edit Room" : "Add Room"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
                Name
              </label>

              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200"
              />
            </div>

            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
                Capacity
              </label>

              <input
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200"
              />
            </div>

            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
                Room Number
              </label>

              <input
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
                Room Type
              </label>

              <select
                name="roomTypeId"
                value={formData.roomTypeId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200"
              >
                <option value="">Select Room Type</option>

                {ROOM_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
                Building
              </label>

              <select
                value={selectedBuildingId}
                onChange={(e) => setSelectedBuildingId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200"
              >
                <option value="">Select Building</option>

                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-[12px]"
          >
            {editingId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* ================= SEARCH & TABLE ================= */}
      <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900">Rooms</h2>

            <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {rooms.length} Rooms
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px]"
              />
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-4 py-2.5 min-w-[90px] rounded-[12px] border border-blue-200 text-blue-600 bg-white text-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Capacity</th>
                <th className="py-3 px-4 font-semibold">Room Number</th>
                <th className="py-3 px-4 font-semibold">Room Type</th>
                <th className="py-3 px-4 font-semibold">Building</th>
                <th className="py-3 px-4 font-semibold text-right print:hidden">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              )}

              {!isLoading && rooms.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-6 text-gray-400"
                  >
                    No rooms found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4 font-medium text-gray-900">
                      {room.name}
                    </td>

                    <td className="py-4 px-4">{room.capacity}</td>

                    <td className="py-4 px-4">{room.roomNumber}</td>

                    <td className="py-4 px-4">
                      {ROOM_TYPES.find(
                        (t) => t.value === room.roomTypeId
                      )?.label || "—"}
                    </td>

                    <td className="py-4 px-4">
                      {buildings.find((b) => b.id === room.buildingId)?.name ||
                        "—"}
                    </td>

                    <td className="py-4 px-4 text-right print:hidden">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(room.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-2">
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