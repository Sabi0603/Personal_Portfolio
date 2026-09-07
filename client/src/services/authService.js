import api from './api';

export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const logout = async () => {
  try {
    const res = await api.post('/auth/logout');
    return res.data;
  } catch {
    // Stateless token logout fails safely on network issues
    return { success: true };
  }
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data?.admin;
};

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email }, { timeout: 15000 });
  return res;
};

export const resetPassword = async (token, password) => {
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await api.put('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return res.data;
};

