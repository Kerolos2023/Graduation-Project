

"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Pencil, Trash2, Search, Loader2, ChevronsUpDown, X, AlertCircle } from "lucide-react"
import { staffService } from "@/services/stuffServices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { Pagination } from '@/components/ui/pagination'

const PERMISSIONS_LIST = [
  { label: "AcademicAdvising", value: "AcademicAdvising" },
  { label: "Staff", value: "Staff" },
];

export default function StaffPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Staff"]);
  const [openSelect, setOpenSelect] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPageNumber(1);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const scrollToForm = () => {
    if (!formRef.current) return;
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffService.getAllStaff(pageNumber, pageSize, debouncedSearch || undefined);
      const items = res.items ?? res.data ?? [];
      const pages = res.totalPages ?? res.meta?.totalPages ?? 1;
      const count = res.totalCount ?? res.totalNumber ?? items.length;

      setStaff(Array.isArray(items) ? items : []);
      setTotalPages(pages);
      setTotalCount(count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const formFields = Object.fromEntries(formData.entries());

    const payload = {
      ...formFields,
      roles: selectedRoles,
    };

    try {
      if (editingId) {
        const updated = await staffService.updateStaff(editingId, payload);
        setStaff(prev => prev.map(s => s.id === editingId ? updated : s));
        cancelEdit();
      } else {
        const newItem = await staffService.addStaff(payload);
        if (newItem) {
          cancelEdit();
          loadData();
        }
      }
    } catch (error: any) {
      console.error("Error Response:", error);
      const errorData = error.response?.data;

      if (errorData?.errors && typeof errorData.errors === 'object') {
        const messages = Object.values(errorData.errors).flat().join(" | ");
        setErrorMessage(messages);
      } else if (errorData?.title === "User.DuplicateUserName" || error.response?.status === 409) {
        setErrorMessage(errorData?.errors?.[0] || "Name or Username Already Exists.");
      } else if (errorData?.detail) {
        setErrorMessage(errorData.detail);
      } else {
        setErrorMessage("Something went wrong. Please check your inputs and try again.");
      }
      scrollToForm();
    }
  };

  const handleEditClick = async (item: any) => {
    setEditingId(item.id);
    setErrorMessage(null);

    try {
      const fullData = await staffService.getStaffById(item.id);

      if (fullData.roles && Array.isArray(fullData.roles)) {
        setSelectedRoles(fullData.roles);
      } else {
        setSelectedRoles(["Staff"]);
      }

      const innerForm = formRef.current?.querySelector("form");
      if (innerForm) {
        (innerForm.elements.namedItem("name") as HTMLInputElement).value = fullData.name || "";
        (innerForm.elements.namedItem("nationalId") as HTMLInputElement).value = fullData.nationalId || "";
        (innerForm.elements.namedItem("userName") as HTMLInputElement).value = fullData.userName || "";
        (innerForm.elements.namedItem("email") as HTMLInputElement).value = fullData.email || "";
        (innerForm.elements.namedItem("phoneNumber") as HTMLInputElement).value = fullData.phoneNumber || "";
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not load staff details from server.");
    }

    setTimeout(() => { scrollToForm(); }, 50);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErrorMessage(null);
    setSelectedRoles(["Staff"]);
    const innerForm = formRef.current?.querySelector("form");
    innerForm?.reset();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await staffService.deleteStaff(id);
      loadData();
    } catch (error) { console.error(error); }
  };

  const toggleRole = (value: string) => {
    setSelectedRoles(prev => prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]);
  };

  return (
    <div className="w-full h-full flex flex-col gap-6 font-inter pb-8">

      {/* FORM CARD */}
      <div ref={formRef} className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0] shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">
            {editingId ? "Edit Staff" : "Adding Staff"}
          </h1>

          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs font-bold transition-colors cursor-pointer border border-transparent">
              <X className="h-4 w-4" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Name</label>
              <Input name="name" placeholder="Name" required className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">National ID</label>
              <Input name="nationalId" placeholder="National ID" className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Username</label>
              <Input name="userName" placeholder="Username" required className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
            </div>

            {!editingId && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[13px] font-bold text-gray-900 ml-1">Password</label>
                <Input name="password" type="password" placeholder="Password" required className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
              </div>
            )}

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Email</label>
              <Input name="email" type="email" placeholder="Email" className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Phone Number</label>
              <Input name="phoneNumber" placeholder="Phone Number" required className="w-full px-4 py-2.5 rounded-[12px] border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-sm font-medium h-auto" />
            </div>

            <div className="col-span-full flex flex-col gap-1.5 w-full">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Permissions (Roles)</label>
              <Popover open={openSelect} onOpenChange={setOpenSelect}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-auto min-h-[42px] justify-between rounded-[12px] border border-gray-200 bg-white px-4 py-2 flex-wrap gap-2 text-slate-500 font-normal focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm">
                    <div className="flex flex-wrap gap-1">
                      {selectedRoles.map((role) => (
                        <Badge key={role} className="bg-[#eff4ff] text-blue-600 border border-blue-100 hover:bg-[#eff4ff] rounded-lg font-medium px-2 py-0.5 shadow-none text-xs flex items-center gap-1">
                          {role}
                          <span
                            className="ml-1 h-3 w-3 cursor-pointer text-blue-500 hover:text-blue-700 flex items-center justify-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleRole(role);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <X className="h-3 w-3" />
                          </span>
                        </Badge>
                      ))}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 opacity-50 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-xl shadow-xl">
                  <Command>
                    <CommandInput placeholder="Search permissions..." />
                    <CommandList>
                      <CommandEmpty>No results found.</CommandEmpty>
                      <CommandGroup>
                        {PERMISSIONS_LIST.map((p) => (
                          <CommandItem key={p.value} onSelect={() => toggleRole(p.value)} className="cursor-pointer">
                            <Checkbox checked={selectedRoles.includes(p.value)} className="mr-2" /> {p.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <button type="submit" className={`w-full active:scale-[0.99] text-white font-semibold py-3.5 rounded-[12px] transition-all shadow-sm cursor-pointer text-sm flex items-center justify-center ${editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {editingId ? "Save Changes" : "Add"}
          </button>
        </form>
      </div>

      {/* LIST CARD */}
      <div className="bg-white rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#eaebf0]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">Staff List</h2>
            <span className="bg-[#eff4ff] text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-blue-100">
              {totalCount} Members
            </span>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-[280px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-[12px] focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm font-medium h-auto"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                }}
              />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="hidden md:flex items-center w-full px-5 py-4 mb-3 border border-gray-100 bg-[#fafafa] rounded-xl">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-[13px] font-bold text-gray-800 w-1/2">Name</span>
          </div>
          <div className="w-[80px]"></div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col gap-3 mb-8">
          {loading ? (
            <div className="text-center p-4 text-gray-500 text-sm">
              <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
            </div>
          ) : staff.length === 0 ? (
            <div className="text-center p-8 text-gray-400 border border-gray-100 rounded-xl border-dashed">
              No staff members found.
            </div>
          ) : (
            staff.map((item) => (
              <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center w-full px-5 py-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white group gap-3 sm:gap-4 relative ${editingId === item.id ? "bg-blue-50/50 border-blue-200" : ""
                }`}>

                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 flex-1 w-full">
                  <div className="w-full sm:w-1/2 truncate">
                    <span className="text-[10px] uppercase font-bold text-gray-400 sm:hidden block mb-1">Name</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate">{item.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                  <button
                    onClick={() => handleEditClick(item)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Pencil className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors bg-white cursor-pointer"
                  >
                    <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Pagination */}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}