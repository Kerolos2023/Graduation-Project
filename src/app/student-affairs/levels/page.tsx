"use client";
import { useState, useEffect } from "react";

interface Row {
  id: number;
  name: string;
  min: string;
  max: string;
}

interface Semester {
  id: number;
  title: string;
  badge: string;
  rows: Row[];
}

interface Level {
  id: number;
  title: string;
  badge: string;
  semesters: Semester[];
}

const DUMMY_DATA: Level[] = [
  {
    id: 1,
    title: "Level One",
    badge: "100 Room",
    semesters: [
      {
        id: 1,
        title: "Semseter 01",
        badge: "100 Room",
        rows: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          name: "John Dee",
          min: "John Dee",
          max: "John Dee",
        })),
      },
      { id: 2, title: "Semseter 02", badge: "100 Room", rows: [] },
      { id: 3, title: "Semseter 03", badge: "100 Room", rows: [] },
    ],
  },
  { id: 2, title: "Level Two", badge: "100 Room", semesters: [] },
  { id: 3, title: "Level Three", badge: "100 Room", semesters: [] },
];

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [openLevels, setOpenLevels] = useState<number[]>([1]);
  const [openSemesters, setOpenSemesters] = useState<number[]>([1]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/levels")
      .then((r) => r.json())
      .then((data) => {
        setLevels(data.data || DUMMY_DATA);
        setLoading(false);
      })
      .catch(() => {
        setLevels(DUMMY_DATA);
        setLoading(false);
      });
  }, []);

  const toggleLevel = (id: number) =>
    setOpenLevels((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSemester = (id: number) =>
    setOpenSemesters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleDelete = async (semesterId: number, rowId: number) => {
    await fetch(/api/levels/rows/${rowId}, { method: "DELETE" });
    setLevels((prev) =>
      prev.map((level) => ({
        ...level,
        semesters: level.semesters.map((sem) =>
          sem.id === semesterId
            ? { ...sem, rows: sem.rows.filter((r) => r.id !== rowId) }
            : sem
        ),
      }))
    );
  };

  const handleEdit = (row: Row) => {
    console.log("Edit row:", row);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto space-y-3">
        {levels.map((level) => (
          <div key={level.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Level Header */}
            <button
              onClick={() => toggleLevel(level.id)}
              className="w-full flex items-center justify-between px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-800">{level.title}</span>
                <span className="text-xs bg-blue-50 text-blue-500 font-medium px-3 py-1 rounded-full">
                  {level.badge}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
                {openLevels.includes(level.id) ? "▲" : "▼"}
              </div>
            </button>

            {/* Semesters */}
            {openLevels.includes(level.id) && (
              <div className="px-4 pb-4 space-y-3">
                {level.semesters.map((sem) => (
                  <div
                    key={sem.id}
                    className={`rounded-xl border-2 overflow-hidden ${
                      openSemesters.includes(sem.id) ? "border-blue-500" : "border-gray-100"
}`}
                  >
                    {/* Semester Header */}
                    <button
                      onClick={() => toggleSemester(sem.id)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-gray-800">{sem.title}</span>
                        <span className="text-xs bg-blue-50 text-blue-500 font-medium px-3 py-1 rounded-full">
                          {sem.badge}
                        </span>
                      </div>
                      <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
                        {openSemesters.includes(sem.id) ? "▲" : "▼"}
                      </div>
                    </button>

                    {/* Table */}
                    {openSemesters.includes(sem.id) && (
                      <div className="px-4 pb-4 space-y-2">
                        <div className="grid grid-cols-4 px-4 py-2">
                          <span className="text-sm text-gray-500">Name</span>
                          <span className="text-sm text-gray-500">Min</span>
                          <span className="text-sm text-gray-500">Max</span>
                          <span></span>
                        </div>

                        {sem.rows.length === 0 ? (
                          <p className="text-center text-gray-400 text-sm py-4">No data</p>
                        ) : (
                          sem.rows.map((row) => (
                            <div
                              key={row.id}
                              className="grid grid-cols-4 items-center bg-white border border-gray-100 rounded-xl px-4 py-3"
                            >
                              <span className="text-sm text-gray-700">{row.name}</span>
                              <span className="text-sm text-gray-700">{row.min}</span>
                              <span className="text-sm text-gray-700">{row.max}</span>
                              <div className="flex items-center gap-3 justify-end">
                                <button
                                  onClick={() => handleEdit(row)}
                                  className="text-gray-400 hover:text-blue-500 transition-colors"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDelete(sem.id, row.id)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}









































































































































