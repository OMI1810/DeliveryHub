import { API_URL } from "@/constants";
import authTokenService from "@/services/auth/auth-token.service";
import authService from "@/services/auth/auth.service";
import axios, { CreateAxiosDefaults } from "axios";
import { errorCatch, getContentType } from "./api.helper";

const axiosOptions: CreateAxiosDefaults = {
  baseURL: API_URL,
  headers: getContentType(),
  withCredentials: true,
};

export const axiosClassic = axios.create(axiosOptions);

export const instance = axios.create(axiosOptions);

instance.interceptors.request.use((config) => {
  const accessToken = authTokenService.getAccessToken();

  if (config?.headers && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

instance.interceptors.response.use(
  (config) => config,
  async (error: unknown) => {
    const axiosError = error as {
      config?: Record<string, unknown>;
      response?: { status?: number };
    };
    const originalRequest = axiosError.config;

    const status = axiosError.response?.status;
    const message = errorCatch(error);

    if (
      (status === 401 ||
        message === "jwt expired" ||
        message === "jwt must be provided") &&
      originalRequest &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      try {
        await authService.getNewTokens();
        return instance.request(originalRequest);
      } catch (refreshError) {
        const refreshMessage = errorCatch(refreshError);
        if (
          refreshMessage === "jwt expired" ||
          refreshMessage === "Refresh token not passed"
        ) {
          authTokenService.removeAccessToken();
        }
        throw refreshError;
      }
    }

    throw error;
  },
);
