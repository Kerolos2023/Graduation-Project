"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Pencil, Trash2, Printer } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Pagination } from "@/components/ui/pagination";

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

  const [totalPages, setTotalPages] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
const topRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    roomNumber: "",
    type: "",
  });

  // ================= Fetch Buildings =================
  const fetchBuildings = async () => {
    try {
      const res = await axiosInstance.get(
        `/buildings?PageNumber=1&PageSize=100`
      );

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
          searchValue ? `&SearchValue=${searchValue}` : ""
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
  }, [selectedBuildingId, pageNumber, pageSize, searchValue]);

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
    String(
      room.buildingId ?? room.building?.id ?? selectedBuildingId ?? ""
    )
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

  // ================= Print =================
  const handlePrint = () => {
    window.print();
  };

  return (
    <div ref={topRef} className="w-full flex flex-col gap-6 pb-8 font-inter">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}
      <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0] print:hidden">
        <h1 className="text-xl font-bold mb-6">
          {editingId ? "Edit Room" : "Add Room"}
        </h1>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
        >
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
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200"
              >
                <option value="">Select Room Type</option>

                {ROOM_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
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
  disabled={!!editingId}
  className={`w-full px-4 py-2.5 rounded-[12px] border border-gray-200 ${
    editingId
      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
      : ""
  }`}
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-[12px]"
          >
            {editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-[24px] p-6 shadow border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 print:hidden">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900">
              Rooms
            </h2>

            <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {rooms.length} Rooms
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

              <input
                type="text"
                placeholder="Search by room name or number"
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setPageNumber(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 text-gray-600">
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Capacity</th>
                <th className="py-3 px-4 font-semibold">
                  Room Number
                </th>
                <th className="py-3 px-4 font-semibold">
                  Room Type
                </th>

                <th className="py-3 px-4 font-semibold text-right print:hidden">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
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

                    <td className="py-4 px-4">
                      {room.capacity}
                    </td>

                    <td className="py-4 px-4">
                      {String(room.roomNumber)}
                    </td>

                    <td className="py-4 px-4">
                      {ROOM_TYPES.find(
                        (t) =>
                          String(t.id) === String(room.roomType || room.type) ||
                          String(t.name) === String(room.roomType || room.type)
                      )?.label || "—"}
                    </td>

                    <td className="py-4 px-4 text-right print:hidden">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(room)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
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