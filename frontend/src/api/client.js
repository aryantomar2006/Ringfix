import axios from 'axios';

const TOKEN_KEY = 'ringfix_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const client = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res.data.data ?? res.data,
  (err) => {
    if (err.response?.status === 401 && tokenStore.get()) {
      tokenStore.clear();
      window.location.href = '/login';
    }
    const message = err.response?.data?.message || err.message;
    const details = err.response?.data?.details;
    return Promise.reject(Object.assign(new Error(message), { details }));
  }
);

export default client;
