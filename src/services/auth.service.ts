import axiosInstance from '@/lib/axios';

export interface LoginPayload {
  userName: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  id: string;
  name: string;
  email: string | null;
  roles: string[];
  imageUrl: string | null;
}

export interface ForgetPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
}

export interface VerificationCodePayload {
  email: string;
  code: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/Auth/login', payload);
    return response.data;
  },

  sendResetPassword: async (payload: ForgetPasswordPayload) => {
    const response = await axiosInstance.post('/Auth/send-reset-password', payload);
    return response.data;
  },

  verifyResetCode: async (payload: VerificationCodePayload) => {
    const response = await axiosInstance.post('/Auth/Verification-Reset-Password-Code', payload);
    return response.data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const response = await axiosInstance.patch('/Auth/reset-password', payload);
    return response.data;
  },

  logout: async () => {
    await axiosInstance.post('/Auth/revoke-refresh-token');
  },
};