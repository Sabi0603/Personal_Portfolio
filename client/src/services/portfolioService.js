import api from './api';

export const getProfile = async () => {
  const res = await api.get('/profile');
  return res.data;
};

export const getProjects = async () => {
  const res = await api.get('/projects');
  return res.data || [];
};

export const getProjectBySlug = async (slug) => {
  const res = await api.get(`/projects/${slug}`);
  return res.data;
};

export const getExperience = async () => {
  const res = await api.get('/experience');
  return res.data || [];
};

export const getEducation = async () => {
  const res = await api.get('/education');
  return res.data || [];
};

export const getCertifications = async () => {
  const res = await api.get('/certifications');
  return res.data || [];
};

export const getSocialLinks = async () => {
  const res = await api.get('/social-links');
  return res.data || [];
};

export const getSkills = async (params = {}) => {
  const res = await api.get('/skills', { params });
  return res.data || [];
};

export const getSettings = async () => {
  const res = await api.get('/settings');
  return res.data;
};

export const sendContactMessage = async (payload) => {
  const res = await api.post('/contact', payload);
  return res;
};
