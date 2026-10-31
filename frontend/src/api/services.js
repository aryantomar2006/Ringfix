import client from './client';

export const authApi = {
  login: (body) => client.post('/auth/login', body),
  register: (body) => client.post('/auth/register', body),
  me: () => client.get('/auth/me'),
};

export const complaintApi = {
  list: (params) => client.get('/complaints', { params }),
  get: (id) => client.get(`/complaints/${id}`),
  create: (formData) => client.post('/complaints', formData),
  updateStatus: (id, body) => client.patch(`/complaints/${id}/status`, body),
  assign: (id, staffId) => client.patch(`/complaints/${id}/assign`, { staffId }),
};

export const opsApi = {
  publicStats: () => client.get('/public/stats'),
  heatmap: () => client.get('/public/heatmap'),
  areaDensity: () => client.get('/analytics/areas'),
  staff: () => client.get('/staff'),
  createStaff: (body) => client.post('/staff', body),
  runSla: () => client.post('/sla/scan'),
  notifications: () => client.get('/notifications'),
  markAllRead: () => client.patch('/notifications/read'),
  download: async (kind, params) => {
    const res = await client.get(`/reports/${kind}`, { params, responseType: 'blob', transformResponse: (d) => d });
    return res;
  },
};
