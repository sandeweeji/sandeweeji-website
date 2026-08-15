import axios, { AxiosError } from "axios";

/* -------------------------------------------------------------------------- */
/* NOTE: This is a reference file.                                           */
/* You already have axiosGet / axiosPost / axiosPut / axiosDelete — only     */
/* axiosPatch is new here (needed for the partial-update endpoints, e.g.     */
/* toggling product availability without re-sending the whole product).      */
/* Merge just that piece into your existing lib/axios.ts.                    */
/* -------------------------------------------------------------------------- */

const api = axios.create({
  baseURL: "/api",
});

interface ApiEnvelope<T> {
  status: number;
  message?: string;
  data?: T;
}

function unwrapError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiEnvelope<unknown>>;
    const message = axiosError.response?.data?.message;

    if (message) {
      return new Error(message);
    }
  }

  return error instanceof Error ? error : new Error("حدث خطأ غير متوقع.");
}

export async function axiosGet<T>(path: string): Promise<ApiEnvelope<T>> {
  try {
    const response = await api.get<ApiEnvelope<T>>(`/${path}`);
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
}

export async function axiosPost<Payload, T>(
  path: string,
  payload: Payload,
): Promise<ApiEnvelope<T>> {
  try {
    const response = await api.post<ApiEnvelope<T>>(`/${path}`, payload);
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
}

export async function axiosPut<Payload, T>(
  path: string,
  payload: Payload,
): Promise<ApiEnvelope<T>> {
  try {
    const response = await api.put<ApiEnvelope<T>>(`/${path}`, payload);
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
}

/** NEW — partial update. Use for things like toggling `available` alone. */
export async function axiosPatch<Payload, T>(
  path: string,
  payload: Payload,
): Promise<ApiEnvelope<T>> {
  try {
    const response = await api.patch<ApiEnvelope<T>>(`/${path}`, payload);
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
}

export async function axiosDelete<T>(path: string): Promise<ApiEnvelope<T>> {
  try {
    const response = await api.delete<ApiEnvelope<T>>(`/${path}`);
    return response.data;
  } catch (error) {
    throw unwrapError(error);
  }
}
