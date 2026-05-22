import axiosInstance from "@/lib/axios";
import { COLLEGE_ID } from "@/lib/constants";

export const studentProfileService = {
  getPersonalData: async () => {
    const res = await axiosInstance.get(`/students/personal-data`);
    return res.data;
  },

  getParentData: async () => {
    const res = await axiosInstance.get(`/students/parent-data`);
    return res.data;
  },

  getContactData: async () => {
    const res = await axiosInstance.get(`/students/contact-data`);
    return res.data;
  },

  getMilitaryData: async () => {
    const res = await axiosInstance.get(`/students/military-data`);
    return res.data;
  },

  getQualificationData: async () => {
    const res = await axiosInstance.get(`/students/previous-qualification-data`);
    return res.data;
  },

  getAllData: async () => {
    const [personal, parent, contact, military, qualification] = await Promise.all([
      axiosInstance.get(`/students/personal-data`),
      axiosInstance.get(`/students/parent-data`),
      axiosInstance.get(`/students/contact-data`),
      axiosInstance.get(`/students/military-data`),
      axiosInstance.get(`/students/previous-qualification-data`),
    ]);

    return {
      personal: personal.data,
      parent: parent.data,
      contact: contact.data,
      military: military.data,
      qualification: qualification.data,
    };
  },

  getAcademicHistory: async () => {
    const res = await axiosInstance.get(`/students/academic-history`);
    return res.data || [];
  },

  getPersonalDataForStudent: async (studentId: string) => {
    const res = await axiosInstance.get(`/students/personal-data`, {
      params: { studentId },
    });
    return res.data;
  },

  updatePersonalData: async (
    data: Record<string, unknown>,
    studentId: string,
    academicProgramId: string
  ) => {
    const res = await axiosInstance.put(
      `/students/personal-data`,
      {
        ...data,
      },
      {
        params: {
          studentId,
          academicProgramId,
        },
      }
    );

  return res.data;
},

  getContactDataForStudent: async (studentId: string) => {
    const res = await axiosInstance.get(`/students/contact-data`, {
      params: { studentId },
    });
    return res.data;
  },

  updateContactData: async (data: Record<string, unknown>, studentId: string) => {
    const res = await axiosInstance.put(`/students/contact-data`, data, {
      params: { studentId },
    });
    return res.data;
  },

  getParentDataForStudent: async (studentId: string) => {
    const res = await axiosInstance.get(`/students/parent-data`, {
      params: { studentId },
    });
    return res.data;
  },

  updateParentData: async (data: Record<string, unknown>, studentId: string) => {
    const res = await axiosInstance.put(`/students/parent-data`, data, {
      params: { studentId },
    });
    return res.data;
  },

  getMilitaryDataForStudent: async (studentId: string) => {
    const res = await axiosInstance.get(`/students/military-data`, {
      params: { studentId },
    });
    return res.data;
  },

  updateMilitaryData: async (data: Record<string, unknown>, studentId: string) => {
    const res = await axiosInstance.put(`/students/military-data`, data, {
      params: { studentId },
    });
    return res.data;
  },

  getQualificationDataForStudent: async (studentId: string) => {
    const res = await axiosInstance.get(`/students/previous-qualification-data`, {
      params: { studentId },
    });
    return res.data;
  },

  updateQualificationData: async (data: Record<string, unknown>, studentId: string) => {
    const res = await axiosInstance.put(`/students/previous-qualification-data`, data, {
      params: { studentId },
    });
    return res.data;
  },
};