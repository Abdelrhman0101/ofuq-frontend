import axios from "axios";

function normalizeBaseURL(u?: string) {
  if (!u) throw new Error("NEXT_PUBLIC_API_URL is missing in .env.local");
  return u.endsWith("/") ? u.slice(0, -1) : u;
}

const baseURL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL);

export const http = axios.create({
  baseURL,
  withCredentials: false,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

// (اختياري) Interceptor لعرض الأخطاء بوضوح أثناء التطوير
if (process.env.NODE_ENV !== "production") {
  http.interceptors.response.use(
    (r) => r,
    (err) => {
      console.error("[HTTP ERROR]", {
        url: err?.config?.url,
        method: err?.config?.method,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      return Promise.reject(err);
    }
  );
}