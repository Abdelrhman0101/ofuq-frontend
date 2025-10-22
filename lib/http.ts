import axios from "axios";

function normalizeBaseURL(u?: string) {
  if (!u) throw new Error("NEXT_PUBLIC_API_URL is missing in .env.local");
  let url = u.trim();
  if (url.endsWith("/")) url = url.slice(0, -1);
  try {
    const parsed = new URL(url);
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (isLocal && parsed.protocol === "https:") {
      // في التطوير المحلي لا يوجد شهادة SSL عادةً، لذا نستخدم http
      parsed.protocol = "http:";
      url = parsed.toString().replace(/\/$/, "");
      if (process.env.NODE_ENV !== "production") {
        console.warn("[HTTP] Using HTTP for local backend:", url);
      }
    }
  } catch (_) {}
  return url;
}

const baseURL = normalizeBaseURL(process.env.NEXT_PUBLIC_API_URL);

export const http = axios.create({
  baseURL,
  withCredentials: false,
  headers: { Accept: "application/json" },
  timeout: 15000,
});

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