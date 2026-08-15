import { IResponse } from "@/interfaces/interfaces";
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL + "/api/",
  withCredentials: true,
});

export const axiosGet = async <T>(path: string): Promise<IResponse<T>> => {
  try {
    const response = await api.get(path);

    return response.data as IResponse<T>;
  } catch (error: any) {
    return {
      status: error?.response?.status ?? 500,
      message: error?.response?.data?.message ?? "حدث خطأ أثناء جلب البيانات.",
      data: error?.response?.data?.data,
    };
  }
};

export const axiosPost = async <TRequest, TResponse>(
  path: string,
  dto: TRequest,
): Promise<IResponse<TResponse>> => {
  try {
    const response = await api.post(path, dto);

    return response.data as IResponse<TResponse>;
  } catch (error: any) {
    return {
      status: error?.response?.status ?? 500,
      message:
        error?.response?.data?.message ?? "حدث خطأ أثناء إضافة البيانات.",
      data: error?.response?.data?.data,
    };
  }
};

export const axiosPut = async <TRequest, TResponse>(
  path: string,
  dto?: TRequest,
): Promise<IResponse<TResponse>> => {
  try {
    const response = await api.put(path, dto);

    return response.data as IResponse<TResponse>;
  } catch (error: any) {
    return {
      status: error?.response?.status ?? 500,
      message:
        error?.response?.data?.message ?? "حدث خطأ أثناء تعديل البيانات.",
      data: error?.response?.data?.data,
    };
  }
};

export const axiosDelete = async <T>(path: string): Promise<IResponse<T>> => {
  try {
    const response = await api.delete(path);

    return response.data as IResponse<T>;
  } catch (error: any) {
    return {
      status: error?.response?.status ?? 500,
      message: error?.response?.data?.message ?? "حدث خطأ أثناء حذف البيانات.",
      data: error?.response?.data?.data,
    };
  }
};
