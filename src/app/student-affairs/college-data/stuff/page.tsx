"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Pencil, Trash2, Printer, Search, MoreHorizontal, Loader2, Check, ChevronsUpDown, X } from "lucide-react"
import { staffService } from "@/services//stuffServices"
import { cn } from "@/lib/utils"

// Shadcn UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const PERMISSIONS_LIST = [
  { label: "AcademicAdvising", value: "AcademicAdvising" },
  { label: "Staff", value: "Staff" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States للتحكم في الفورم (Add vs Update)
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Staff"]);
  const [openSelect, setOpenSelect] = useState(false);

   
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
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (formRef.current) {
      const form = formRef.current;
      (form.elements.namedItem("name") as HTMLInputElement).value = item.name || "";
      (form.elements.namedItem("nationalId") as HTMLInputElement).value = item.nationalId || "";
      (form.elements.namedItem("userName") as HTMLInputElement).value = item.userName || "";
      (form.elements.namedItem("email") as HTMLInputElement).value = item.email || "";
      (form.elements.namedItem("phoneNumber") as HTMLInputElement).value = item.phoneNumber || "";
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRoles(["Staff"]);
    formRef.current?.reset();
  };

   const onDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await staffService.deleteStaff(id);
      setStaff(prev => prev.filter((item: any) => item.id !== id));
    } catch (error) { console.error(error); }
  };

  const toggleRole = (value: string) => {
    setSelectedRoles(prev => prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]);
  };

  return (
    <div className="p-4 md:p-10 bg-[#F9FAFB] min-h-screen font-sans text-neutral-900">
      
       <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mb-10 transition-all">
        <div className="flex justify-between items-center mb-8 md:mb-10">
          <h1 className="text-xl md:text-2xl font-bold text-[#0A0D12]">
            {editingId ? "Update Staff" : "Adding Staff"}
          </h1>
          
          {editingId && (
            <button 
              onClick={cancelEdit}
              className="flex items-center gap-1 text-red-500 hover:text-red-600 text-xs md:text-sm font-bold transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel Edit</span>
            </button>
          )}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Name</label>
            <Input name="name" placeholder="Name" required className="h-14 border-slate-200 rounded-2xl px-5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">National ID</label>
            <Input name="nationalId" placeholder="National ID" className="h-14 border-slate-200 rounded-2xl px-5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Username</label>
            <Input name="userName" placeholder="Username" required className="h-14 border-slate-200 rounded-2xl px-5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Password</label>
            <Input name="password" type="password" placeholder={editingId ? "Leave empty to keep current" : "Password"} required={!editingId} className="h-14 border-slate-200 rounded-2xl px-5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Email</label>
            <Input name="email" type="email" placeholder="Email" className="h-14 border-slate-200 rounded-2xl px-5" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Phone Number</label>
            <Input name="phoneNumber" placeholder="Phone Number" required className="h-14 border-slate-200 rounded-2xl px-5" />
          </div>

          <div className="col-span-full space-y-2">
            <label className="text-sm font-semibold text-[#090909]">Permissions</label>
            <Popover open={openSelect} onOpenChange={setOpenSelect}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full h-auto min-h-[56px] justify-between rounded-2xl border-slate-200 bg-white px-5 py-2 flex-wrap gap-2">
                  <div className="flex flex-wrap gap-1">
                    {selectedRoles.map((role) => (
                      <Badge key={role} className="bg-[#E2E8F0] text-[#1E293B] hover:bg-[#E2E8F0] rounded-lg">
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
            "col-span-full h-14 rounded-2xl font-bold shadow-lg transition-all",
            editingId ? "bg-red-600 hover:bg-blue-400" : "bg-[#2463F0] hover:bg-[#1D4ED8]"
          )}>
            {editingId ? "Update Teacher" : "Add Teacher"}
          </Button>
        </form>
      </div>

       <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-[#E9EAEB] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#0A0D12]">Staff List</h2>
             <Badge className="bg-[#EFF8FF] text-[#2463F0] border border-[#BEDAFF] rounded-full px-4 py-0.5 text-xs font-semibold">
              {filteredStaff.length} Members
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search" className="pl-12 h-12 w-full md:w-[300px] bg-[#F9FAFB] border-slate-200 rounded-xl" onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-blue-100"><Printer className="h-5 w-5 text-blue-600" /></Button>
            <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-200"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-[60px_1.5fr_1.5fr_2fr_100px] items-center gap-4 px-10 py-5 bg-[#F8FAFC] rounded-2xl text-[11px] font-black text-neutral-600 uppercase tracking-widest">
            <div className="flex justify-start"><Checkbox className="h-5 w-5 border-slate-300 rounded-lg" /></div>
            <div >Name</div>
            <div>Username</div>
            <div>Permissions</div>
            <div className="text-right">Actions</div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>
          ) : (
            filteredStaff.map((item) => (
              <div key={item.id} className={cn(
                "grid grid-cols-1 md:grid-cols-[60px_1.5fr_1.5fr_2fr_100px] items-center gap-4 px-6 md:px-10 py-6 bg-white rounded-[2rem] border transition-all text-sm group",
                editingId === item.id ? "border-blue-500 bg-blue-50/30" : "border-slate-100"
              )}>
                <div className="hidden md:flex justify-start"><Checkbox className="h-5 w-5 border-slate-300 rounded-xl" /></div>
                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Name:</span> 
                  <div className="font-bold text-slate-900">{item.name}</div>
                </div>
                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Username:</span> 
                  <div className="text-slate-600">{item.userName}</div>
                </div>
                <div className="flex md:block justify-between items-center">
                  <span className="md:hidden font-black text-slate-400">Roles:</span> 
                  <ul className="list-disc list-inside text-xs text-slate-500">{item.roles?.map((r: any, i: number) => <li key={i}>{r}</li>)}</ul>
                </div>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="h-9 w-9 text-slate-400 hover:text-blue-600"><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="h-9 w-9 text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}