import axiosInstance from "@/lib/axios";

const COLLEGE_ID = "019c1ea6-1738-71cb-8cfd-a90e126d177e";

export const staffService = {
  getAllStaff: async () => {
    const response = await axiosInstance.get(`/colleges/${COLLEGE_ID}/stuff`);
    return response.data; 
  },

  addStaff: async (data: any) => {
    const response = await axiosInstance.post(`/colleges/${COLLEGE_ID}/stuff`, {
      ...data,
      roles: data.roles || ["Staff"],
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
        roles: data.roles || ["Staff"]
    });
    return response.data;
  }
};