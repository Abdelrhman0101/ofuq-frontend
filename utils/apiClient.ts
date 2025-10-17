import { http } from '@/lib/http';
import { getAuthToken } from './authService';

// حافظ على إضافة ترويسة Authorization تلقائيًا كما كان سابقًا
http.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default http;