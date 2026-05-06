import axiosInstance from "@/lib/axios";

export interface AcademicEvent {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
}

export const eventService = {
  getEvents: async (programId: string, semesterId: string, searchValue = "") => {
    const response = await axiosInstance.get(`/events`, {
      params: {
        programId,
        semesterId,
        pageNumber: 1,
        pageSize: 10,
        searchValue: searchValue
      }
    });
    return response.data;
  },

  addEvent: async (programId: string, semesterId: string, data: { type: string, startDate: string, endDate: string }) => {
    return await axiosInstance.post(`/events`,
      {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate
      },
      {
        params: {
          programId,
          semesterId
        }
      }
    );
  },

  deleteEvent: async (programId: string, semesterId: string, eventId: string) => {
    return await axiosInstance.delete(`/events/${eventId}`, {
      params: {
        programId,
        semesterId
      }
    });
  }
};

export default eventService;