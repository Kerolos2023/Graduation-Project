import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";

export const staffService = {
  getAllStaff: async () => {
    const response = await axiosInstance.get(`/colleges/${COLLEGE_ID}/stuff`);
    return response.data; 
  },

  addStaff: async (data: any) => {
    const response = await axiosInstance.post(`/colleges/${COLLEGE_ID}/stuff`, {
      ...data,
      
      roles: data.roles && data.roles.length > 0 ? data.roles : ["Staff"],
    });
    return response.data;
  },

  deleteStaff: async (id: string) => {
    const response = await axiosInstance.delete(`/colleges/${COLLEGE_ID}/stuff/${id}`);
    return response.data;
  },

  updateStaff: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/colleges/${COLLEGE_ID}/stuff/${id}`, {
      ...data,
       roles: data.roles && data.roles.length > 0 ? data.roles : ["Staff"],
    });
    return response.data;
  }
};