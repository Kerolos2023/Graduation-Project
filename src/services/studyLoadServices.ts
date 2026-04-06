import axiosInstance from "@/lib/axios";

export interface StudyLoadPayload {
  academicYearId: string;
  semesterType: string;
  minHours: number;
  maxHours: number;
}

export interface StudyLoadResponse {
  id: string;
  levelId: string;
  levelName: string;
  semesterName: string;
  minHours: number;
  maxHours: number;
}

export const StudyLoadService = {
   
  getAll: async (programId: string): Promise<StudyLoadResponse[]> => {
    const { data } = await axiosInstance.get(`/programs/${programId}/study-load-by-levels`);
     
    return data.items || data;
  },

   
  add: async (programId: string, levelId: string, payload: StudyLoadPayload) => {
    const { data } = await axiosInstance.post(
      `/programs/${programId}/study-load-by-levels/${levelId}`,
      payload
    );
    return data;
  },

  remove: async (programId: string, id: string) => {
    const { data } = await axiosInstance.delete(`/programs/${programId}/study-load-by-levels/${id}`);
    return data;
  },

  update: async (programId: string, id: string, payload: StudyLoadPayload) => {
    const { data } = await axiosInstance.put(`/programs/${programId}/study-load-by-levels/${id}`, payload);
    return data;
  }
};
