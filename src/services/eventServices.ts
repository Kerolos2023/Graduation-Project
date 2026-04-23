import axiosInstance from "@/lib/axios";

 const PROGRAM_ID = '019D5C67-392B-74A6-8E1F-2221FC6BBF0A';
const SEMESTER_ID = '019d7980-c25c-7793-b137-248b067f98d5';

export interface AcademicEvent {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
}

const eventService = {
   getEvents: async (searchValue = "") => {
    const response = await axiosInstance.get(`/events`, {
      params: {
        programId: PROGRAM_ID,
        semesterId: SEMESTER_ID,
        pageNumber: 1,
        pageSize: 10,
        searchValue: searchValue
      }
    });
    return response.data;
  },

   addEvent: async (data: { type: string, startDate: string, endDate: string }) => {
    return await axiosInstance.post(`/events`,
      {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate
      },
      {
        params: {
          programId: PROGRAM_ID,
          semesterId: SEMESTER_ID
        }
      }
    );
  },

     deleteEvent: async (eventId: string) => {
    return await axiosInstance.delete(`/events/${eventId}`, {
      params: {
        programId: PROGRAM_ID,
        semesterId: SEMESTER_ID
      }
    });
  }
};

export default eventService;