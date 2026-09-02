import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { logout } from './auth';

const api = axios.create({
  // baseURL: 'http://192.168.0.144:8000/api',
  baseURL: 'https://api.physioeye.de/api',
});

// ─── Request: attach access token ────────────────────────────────────────────
api.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem('access');

    console.log(
      `[REQUEST] ${config.method?.toUpperCase()} ${
        config.url
      } | Access Token: ${token ? 'YES' : 'NO'}`,
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    console.log('[REQUEST ERROR]', error);
    return Promise.reject(error);
  },
);

// ─── Response: on 401 → refresh token → retry request ────────────────────────
let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  console.log(
    `[QUEUE] Processing queue | Size=${failedQueue.length} | Error=${!!error}`,
  );

  failedQueue.forEach(p => (error ? p.reject(error) : p.resolve(token!)));

  failedQueue = [];

  console.log('[QUEUE] Queue cleared');
};

api.interceptors.response.use(
  response => {
    console.log(
      `[SUCCESS] ${response.config.method?.toUpperCase()} ${
        response.config.url
      } -> ${response.status}`,
    );

    return response;
  },

  async error => {
    const originalRequest = error.config;

    console.log('=================================================');
    console.log('[401 HANDLER] Response Error');
    console.log('[401 HANDLER] URL:', originalRequest?.url);
    console.log('[401 HANDLER] Status:', error.response?.status);
    console.log('[401 HANDLER] _retry:', originalRequest?._retry);
    console.log('[401 HANDLER] isRefreshing:', isRefreshing);
    console.log('=================================================');

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('[STEP 1] Entered 401 handler');

      if (isRefreshing) {
        console.log(
          `[STEP 2] Refresh already in progress. Queueing request. Queue size=${failedQueue.length}`,
        );

        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });

          console.log(
            `[STEP 3] Request added to queue. New size=${failedQueue.length}`,
          );
        }).then(token => {
          console.log('[STEP 4] Queue released. Retrying original request.');

          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        });
      }

      console.log('[STEP 5] No refresh running.');

      originalRequest._retry = true;

      console.log('[STEP 6] originalRequest._retry = true');

      isRefreshing = true;

      console.log('[STEP 7] isRefreshing = TRUE');

      console.log('[STEP 8] Reading refresh token...');

      const refresh = await AsyncStorage.getItem('refresh');

      console.log('[STEP 9] Refresh token exists:', refresh ? 'YES' : 'NO');

      if (!refresh) {
        console.log(
          '[ERROR] Refresh token missing. Logging out. +++++++++++++++++++++++++++++++++++++++++++++',
        );
        isRefreshing = false;
        processQueue(error, null);
        logout();
        return Promise.reject(error);
      }

      try {
        console.log('[STEP 10] Sending refresh request...');

        const { data } = await axios.post(
          // 'http://192.168.0.144:8000/api/users/token/refresh/',
          'https://api.physioeye.de/api/users/token/refresh/',
          {
            refresh,
          },
        );

        console.log('[STEP 11] Refresh SUCCESS');

        console.log('[STEP 12] Saving new access token');

        await AsyncStorage.setItem('access', data.access);

        if (data.refresh) {
          console.log('[STEP 13] Saving rotated refresh token');

          await AsyncStorage.setItem('refresh', data.refresh);
        }

        console.log('[STEP 14] Processing waiting queue');

        processQueue(null, data.access);

        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        console.log('[STEP 15] Retrying original request');

        return api(originalRequest);
      } catch (err) {
        console.log('[STEP 16] REFRESH FAILED');
        console.log(err);

        processQueue(err, null);

        logout();

        return Promise.reject(err);
      } finally {
        console.log('[STEP 17] FINALLY');
        console.log('[STEP 18] isRefreshing = FALSE');

        isRefreshing = false;
      }
    }

    console.log(
      `[REJECT] ${originalRequest?.method?.toUpperCase()} ${
        originalRequest?.url
      }`,
    );

    return Promise.reject(error);
  },
);

export default api;
