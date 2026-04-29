import axiosInstance from "@/lib/axios";

export const committeeService = {
   getAll: async (examTermId: string) => {
    const { data } = await axiosInstance.get(`/exam-terms/${examTermId}/committees`);
    return data;
  },

   add: async (examTermId: string, roomId: string, payload: { CommitteeNumber: number; MaxCapacity: number }) => {
    const { data } = await axiosInstance.post(`/exam-terms/${examTermId}/committees`, payload, {
      params: { RoomId: roomId }
    });
    return data;
  },

     
  getBuildings: async () => {
    const { data } = await axiosInstance.get("/buildings");
    return data;  
  },

   getAvailableRooms: async (buildingId: string, examTermId: string) => {
    const { data } = await axiosInstance.get(`/buildings/${buildingId}/rooms/available-for-committees`, {
      params: { examTermId }  
    });
    return data;   
  },

  delete: async (examTermId: string, id: string) => {
    await axiosInstance.delete(`/exam-terms/${examTermId}/committees/${id}`);
  },

  update: async (examTermId: string, id: string, payload: { CommitteeNumber: number; MaxCapacity: number }) => {
    const { data } = await axiosInstance.put(`/exam-terms/${examTermId}/committees/${id}`, payload);
    return data;
  }
};



 