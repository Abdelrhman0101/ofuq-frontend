// Authentication service for handling API calls
// Final backend base URL (no trailing slash)
const PRIMARY_BASE_URL = 'https://api.ofuq.academy';
const FALLBACK_BASE_URL = 'https://api.ofuq.academy';

const fetchWithFallback = async (endpoint: string, options: RequestInit) => {
  const primaryUrl = `${PRIMARY_BASE_URL}${endpoint}`;
  const fallbackUrl = `${FALLBACK_BASE_URL}${endpoint}`;
  try {
    console.log('[HTTP] Trying primary URL:', primaryUrl);
    const res = await fetch(primaryUrl, options);
    return res;
  } catch (err) {
    console.log('[HTTP] Primary URL failed, error:', err);
    console.log('[HTTP] Trying fallback URL:', fallbackUrl);
    return fetch(fallbackUrl, options);
  }
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface SigninData {
  email: string;
  password: string;
}

// Signup function
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    console.log('[Signup] Preparing request payload', { name: data.name, email: data.email });
    console.log('[Signup] Sending request to', `${PRIMARY_BASE_URL}/api/signup`);
    const response = await fetchWithFallback(`/api/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data),
    });

    console.log('[Signup] Response received with status', response.status);
    if (!response.ok) {
      const raw = await response.text();
      console.log('[Signup] Error response raw', raw);
      let message = 'فشل في إنشاء الحساب';
      try {
        const errorData = JSON.parse(raw);
        message = errorData.message || message;
      } catch {
        if (response.status === 419) {
          message = 'رفض الطلب (419): قد تكون مشكلة CSRF أو مسار غير صحيح.';
        } else {
          message = `HTTP ${response.status}: ${raw.slice(0, 200)}`;
        }
      }
      throw new Error(message);
    }

    const result: AuthResponse = await response.json();
    console.log('[Signup] Parsed response', { user: result.user });
    
    // Force role to student for signup regardless of backend
    const normalizedUser: User = { ...result.user, role: 'student' };
    
    // Save token to localStorage
    console.log('[Signup] Storing auth token and user in localStorage');
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_data', JSON.stringify(normalizedUser));
    console.log('[Signup] Storage complete');
    
    return { user: normalizedUser, token: result.token };
  } catch (error) {
    console.log('Signup Error:', error);
    throw error;
  }
};

// Signin function
export const signin = async (data: SigninData): Promise<AuthResponse> => {
  try {
    console.log('[Signin] Preparing request payload', { email: data.email });
    console.log('[Signin] Sending request to', `${PRIMARY_BASE_URL}/auth/signin`);
    const response = await fetchWithFallback(`/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data),
    });

    console.log('[Signin] Response received with status', response.status);
    if (!response.ok) {
      const raw = await response.text();
      console.log('[Signin] Error response raw', raw);
      let message = 'فشل في تسجيل الدخول';
      try {
        const errorData = JSON.parse(raw);
        message = errorData.message || message;
      } catch {
        if (response.status === 419) {
          message = 'رفض الطلب (419): قد تكون مشكلة CSRF أو مسار غير صحيح.';
        } else {
          message = `HTTP ${response.status}: ${raw.slice(0, 200)}`;
        }
      }
      throw new Error(message);
    }

    const result: AuthResponse = await response.json();
    console.log('[Signin] Parsed response', { user: result.user });
    
    // Save token to localStorage
    console.log('[Signin] Storing auth token and user in localStorage');
    localStorage.setItem('auth_token', result.token);
    localStorage.setItem('user_data', JSON.stringify(result.user));
    console.log('[Signin] Storage complete');
    
    return result;
  } catch (error) {
    console.log('Signin Error:', error);
    throw error;
  }
};

// Signout function
export const signout = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('auth_token');
    console.log('[Signout] Starting signout. Token exists:', !!token);
    
    const response = await fetchWithFallback(`/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('[Signout] Response received with status', response.status);
    if (!response.ok) {
      const raw = await response.text();
      console.log('[Signout] Error response raw', raw);
      let message = 'فشل في تسجيل الخروج';
      try {
        const errorData = JSON.parse(raw);
        message = errorData.message || message;
      } catch {
        if (response.status === 419) {
          message = 'رفض الطلب (419): قد تكون مشكلة CSRF أو مسار غير صحيح.';
        } else {
          message = `HTTP ${response.status}: ${raw.slice(0, 200)}`;
        }
      }
      throw new Error(message);
    }

    // Clear localStorage
    console.log('[Signout] Clearing localStorage');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    console.log('[Signout] Storage cleared');
    
  } catch (error) {
    console.log('Signout Error:', error);
    // Clear localStorage even if API call fails
    console.log('[Signout] Clearing localStorage on error');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    throw error;
  }
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.log('Get Current User Error:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('auth_token');
  const userData = localStorage.getItem('user_data');
  return !!(token && userData);
};

// Get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};