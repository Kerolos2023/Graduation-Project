 














"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Pencil, Trash2,Search,Loader2, ChevronsUpDown, X } from "lucide-react"
import { staffService } from "@/services/stuffServices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"

const PERMISSIONS_LIST = [
  { label: "AcademicAdvising", value: "AcademicAdvising" },
  { label: "Staff", value: "Staff" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  
  const formRef = useRef<HTMLDivElement>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Staff"]);
  const [openSelect, setOpenSelect] = useState(false);


  const scrollToForm = () => {
    if (!formRef.current) return;
    formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffService.getAllStaff();
      const data = Array.isArray(res) ? res : (res.items || []);
      setStaff(data);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData() }, [loadData]);

  const filteredStaff = useMemo(() => {
    return staff.filter(s =>
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staff, searchQuery]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(formData.entries()),
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
          setStaff((prev) => [newItem, ...prev]);
          cancelEdit();
        }
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      if (error.response?.status === 409 || errorData?.title === "User.DuplicateUserName") {
        const msg = errorData?.errors?.[0] || "Name or UserName Already Exist";
        alert(`Error: ${msg}`);
      } else {
        console.error(error);
        alert("Something went wrong. Please check your data.");
      }
    }
  };

  const handleEditClick = (item: any) => {
    setEditingId(item.id);
    setSelectedRoles(item.roles || ["Staff"]);

    const innerForm = formRef.current?.querySelector("form");
    if (innerForm) {
      (innerForm.elements.namedItem("name") as HTMLInputElement).value = item.name || "";
      (innerForm.elements.namedItem("nationalId") as HTMLInputElement).value = item.nationalId || "";
      (innerForm.elements.namedItem("userName") as HTMLInputElement).value = item.userName || "";
      (innerForm.elements.namedItem("email") as HTMLInputElement).value = item.email || "";
      (innerForm.elements.namedItem("phoneNumber") as HTMLInputElement).value = item.phoneNumber || "";
    }

    
    setTimeout(() => {
      scrollToForm();
    }, 50);  
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRoles(["Staff"]);
    const innerForm = formRef.current?.querySelector("form");
    innerForm?.reset();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await staffService.deleteStaff(id);
      setStaff(prev => prev.filter((item: any) => item.id !== id));
    } catch (error) { console.error(error); }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleRole = (value: string) => {
    setSelectedRoles(prev => prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 bg-[#F5F5F5] min-h-screen font-sans text-neutral-900">

        <div ref={formRef} className="bg-[#FFFFFF] p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-[#E9EAEB] scroll-mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg md:text-xl font-bold text-[#0A0D12]">
            {editingId ? "Update Staff" : "Add Staff"}
          </h1>

          {editingId && (
            <button onClick={cancelEdit} className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs md:text-sm font-bold transition-colors">
              <X className="h-4 w-4" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Name</label>
            <Input name="name" placeholder="Name" required className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">National ID</label>
            <Input name="nationalId" placeholder="National ID" className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Username</label>
            <Input name="userName" placeholder="Username" required className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Password</label>
            <Input name="password" type="password" placeholder={editingId ? "Leave empty to keep current" : "Password"} required={!editingId} className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Email</label>
            <Input name="email" type="email" placeholder="Email" className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Phone Number</label>
            <Input name="phoneNumber" placeholder="Phone Number" required className="h-11 rounded-xl border-slate-200 focus-visible:ring-blue-600 bg-white" />
          </div>

          <div className="col-span-full space-y-1.5">
            <label className="text-sm font-semibold text-[#090909]">Permissions</label>
            <Popover open={openSelect} onOpenChange={setOpenSelect}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-auto min-h-[44px] justify-between rounded-xl border-slate-200 bg-white px-4 py-2 flex-wrap gap-2 text-slate-500 font-normal">
                  <div className="flex flex-wrap gap-1">
                    {selectedRoles.map((role) => (
                      <Badge key={role} className="bg-slate-100 text-slate-900 hover:bg-slate-200 rounded-lg font-medium border-none px-2 py-0.5">
                        {role} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleRole(role); }} />
                      </Badge>
                    ))}
                  </div>
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
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

          <Button type="submit" className={cn(
            "col-span-full h-11 cursor-pointer font-bold rounded-xl transition-all text-white",
            editingId ? "bg-purple-600 hover:bg-purple-700" : "bg-blue-600 hover:bg-blue-700"
          )}>
            {editingId ? "Save Changes" : "Add Staff"}
          </Button>
        </form>
      </div>

       <div className="bg-white p-4 md:p-8 rounded-[20px] md:rounded-[24px] shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0D12]">Staff List</h2>
            <Badge className="bg-blue-50 text-blue-600 border-none px-3 py-1 rounded-full text-xs font-bold">
              {filteredStaff.length} Members
            </Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search" className="pl-10 h-10 border-slate-200 rounded-xl focus-visible:ring-slate-300 w-full" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
           <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_2fr_100px] px-6 py-4 bg-[#FAFAFA] rounded-xl mb-4  text-[#181D27] font-semibold tracking-wider border border-[#E9EAEB]">
            <div>Name</div>
            <div>Username</div>
            <div>Permissions</div>
            <div className="text-right pr-4">Actions</div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-50 rounded-2xl">
              No staff members found.
            </div>
          ) : (
            filteredStaff.map((item) => (
              <div key={item.id} className={cn(
                "flex flex-col md:grid md:grid-cols-[1.5fr_1.5fr_2fr_100px] items-start md:items-center p-4 md:px-6 md:py-5 border rounded-2xl transition-all bg-white gap-3 md:gap-0 border-[#E2E8F0] hover:shadow-md hover:border-blue-200",
                editingId === item.id && "border-blue-200 bg-blue-50/30"
              )}>
                
                <div className="flex flex-col md:block w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Name</span>
                  <div className="font-bold md:font-medium text-slate-900 text-base md:text-sm truncate">{item.name}</div>
                </div>

                <div className="flex flex-col md:block w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Username</span>
                  <div className="text-slate-600 text-sm">{item.userName}</div>
                </div>

                <div className="flex flex-col md:block w-full md:w-auto">
                  <span className="text-[10px] uppercase font-bold text-slate-400 md:hidden mb-1">Permissions</span>
                  <div className="flex flex-wrap gap-1">
                    {item.roles?.map((r: any, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-medium border-none py-0 px-2">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-auto flex justify-end items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 size={16} />
                  </Button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}