import api from './api';

export const getProfile = async () => {
  const res = await api.get('/profile');
  return res.data;
};

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export const getResume = async () => {
  const res = await api.get('/resume');
  return res.data;
};

export const getResumeViewUrl = (id) => {
  return id ? `${API_BASE}/resume/view?id=${encodeURIComponent(id)}` : `${API_BASE}/resume/view`;
};

export const getResumeDownloadUrl = (id) => {
  return id ? `${API_BASE}/resume/download?id=${encodeURIComponent(id)}` : `${API_BASE}/resume/download`;
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

export const getCertificationViewUrl = (id) => {
  return `${API_BASE}/certifications/${encodeURIComponent(id)}/view`;
};

export const getCertificationPreviewUrl = (id) => {
  return `${API_BASE}/certifications/${encodeURIComponent(id)}/preview`;
};

export const getCertificationDownloadUrl = (id) => {
  return `${API_BASE}/certifications/${encodeURIComponent(id)}/download`;
};

export const isPdfCertificate = (cert) => {
  if (!cert?.image?.url) return false;
  if (cert.image?.fileType === 'pdf') return true;
  const url = cert.image.url.toLowerCase();
  const fileName = (cert.image?.fileName || '').toLowerCase();
  return (
    url.endsWith('.pdf') ||
    url.includes('.pdf?') ||
    url.includes('/raw/upload/') ||
    fileName.endsWith('.pdf')
  );
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
