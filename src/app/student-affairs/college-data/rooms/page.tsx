"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Pencil, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";

const ROOM_API = "/Room";
const ROOMTYPE_API = "/RoomType";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);

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

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `${ROOM_API}/all?PageNumber=${pageNumber}&PageSize=${pageSize}${
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
  }, [pageNumber, pageSize, searchValue]);

  const fetchRoomTypes = async () => {
    try {
      const res = await axiosInstance.get(`${ROOMTYPE_API}/all`);
      setRoomTypes(res.data?.items || []);
    } catch (err) {
      console.error("Error fetching room types:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
  }, [fetchRooms]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      capacity: "",
      roomNumber: "",
      roomTypeId: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.capacity ||
      !formData.roomNumber ||
      !formData.roomTypeId
    ) {
      alert("Please fill all fields.");
      return;
    }

    const payload = {
      name: formData.name,
      capacity: Number(formData.capacity),
      roomNumber: formData.roomNumber,
      roomTypeId: formData.roomTypeId,
    };

    try {
      if (editingId) {
        await axiosInstance.put(`${ROOM_API}/${editingId}`, payload);
      } else {
        await axiosInstance.post(`${ROOM_API}/019c80c5-3db5-7df9-83c0-b62421aab6c6`, payload);
      }

      resetForm();
      fetchRooms();
    } catch (err) {
      console.error("Error saving room:", err);
    }
  };

  const handleEdit = (room: any) => {
    setEditingId(room.id);
    setFormData({
      name: room.name,
      capacity: String(room.capacity),
      roomNumber: room.roomNumber,
      roomTypeId: room.roomTypeId,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    await axiosInstance.delete(`${ROOM_API}/${id}`);
    fetchRooms();
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-8">

      <div className="bg-white rounded-[24px] p-6 border border-[#eaebf0]">
        <h1 className="text-xl font-bold mb-6">
          {editingId ? "Edit Room" : "Add Room"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">
              Room Type
            </label>
              <select
                name="roomTypeId"
                value={formData.roomTypeId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm shadow-sm font-medium"
              >
                <option value="">Select Room Type</option>
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
              Name
            </label>
            <input
              name="name"
              placeholder="Room Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
            />
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
              Capacity
            </label>
            <input
              name="capacity"
              type="number"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
            />
            </div>
            <div>
              <label className="text-[13px] font-bold text-gray-900 ml-1">
              Room Number
            </label>
            <input
              name="roomNumber"
              placeholder="Room Number"
              value={formData.roomNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
            />
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

      <div className="bg-white rounded-[24px] p-6 border border-[#eaebf0]">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="flex justify-between items-center border p-4 rounded-xl mb-3"
          >
            <div>
              <p className="font-bold">{room.name}</p>
              <p>Capacity: {room.capacity}</p>
              <p>Room Number: {room.roomNumber}</p>
              <p>
                Type:{" "}
                {
                  roomTypes.find((t) => t.id === room.roomTypeId)?.name ||
                  "—"
                }
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleEdit(room)}>
                <Pencil size={18} />
              </button>
              <button onClick={() => handleDelete(room.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={pageNumber}
            totalPages={totalPages}
            onPageChange={setPageNumber}
          />
        </div>
      </div>
    </div>
  );
}