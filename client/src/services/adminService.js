import api from './api';

// ==========================================
// MEDIA API (Embedded helper service)
// ==========================================

export const uploadMedia = async (file, folder = 'projects') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const res = await api.post('/admin/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000,
  });
  return res?.data ?? res;
};

export const deleteMedia = async (publicId) => {
  if (!publicId) return null;
  const res = await api.delete(`/admin/media?publicId=${encodeURIComponent(publicId)}`);
  return res.data;
};

// ==========================================
// PROFILE API (Single Document)
// ==========================================

export const getAdminProfile = async () => {
  const res = await api.get('/admin/profile');
  return res.data;
};

export const updateAdminProfile = async (profileData) => {
  const res = await api.put('/admin/profile', profileData);
  return res.data;
};

// ==========================================
// SITE SETTINGS API (Single Document)
// ==========================================

export const getAdminSettings = async () => {
  const res = await api.get('/admin/settings');
  return res.data;
};

export const updateAdminSettings = async (settingsData) => {
  const res = await api.put('/admin/settings', settingsData);
  return res.data;
};

// ==========================================
// DASHBOARD AGGREGATED METRICS (Real APIs)
// ==========================================

export const getDashboardSummary = async () => {
  const [
    projectsRes,
    experienceRes,
    educationRes,
    certificationsRes,
    socialLinksRes,
    skillsRes,
    messagesRes,
    healthRes,
  ] = await Promise.allSettled([
    getAdminProjects(),
    getAdminExperiences(),
    getAdminEducations(),
    getAdminCertifications(),
    getAdminSocialLinks(),
    getAdminSkills(),
    getAdminMessages(),
    api.get('/health'),
  ]);

  const rawProjects = projectsRes.status === 'fulfilled' ? projectsRes.value : null;
  const projectsData = rawProjects?.data ?? rawProjects ?? [];
  const projects = Array.isArray(projectsData) ? projectsData : projectsData.items || [];

  const rawExperience = experienceRes.status === 'fulfilled' ? experienceRes.value : null;
  const experienceData = rawExperience?.data ?? rawExperience ?? [];
  const experience = Array.isArray(experienceData) ? experienceData : experienceData.items || [];

  const rawEducation = educationRes.status === 'fulfilled' ? educationRes.value : null;
  const educationData = rawEducation?.data ?? rawEducation ?? [];
  const education = Array.isArray(educationData) ? educationData : educationData.items || [];

  const rawCertifications = certificationsRes.status === 'fulfilled' ? certificationsRes.value : null;
  const certificationsData = rawCertifications?.data ?? rawCertifications ?? [];
  const certifications = Array.isArray(certificationsData) ? certificationsData : certificationsData.items || [];

  const rawSocialLinks = socialLinksRes.status === 'fulfilled' ? socialLinksRes.value : null;
  const socialLinksData = rawSocialLinks?.data ?? rawSocialLinks ?? [];
  const socialLinks = Array.isArray(socialLinksData) ? socialLinksData : socialLinksData.items || [];

  const rawSkills = skillsRes.status === 'fulfilled' ? skillsRes.value : null;
  const skillsData = rawSkills?.data ?? rawSkills ?? [];
  const skills = Array.isArray(skillsData) ? skillsData : skillsData.items || [];

  const rawMessages = messagesRes.status === 'fulfilled' ? messagesRes.value : null;
  const messagesData = rawMessages?.data ?? rawMessages ?? {};
  const messages = Array.isArray(messagesData?.messages)
    ? messagesData.messages
    : Array.isArray(messagesData)
    ? messagesData
    : [];
  const totalMessages = typeof messagesData?.total === 'number'
    ? messagesData.total
    : messages.length;
  const unreadMessagesCount = typeof messagesData?.unreadCount === 'number'
    ? messagesData.unreadCount
    : messages.filter((m) => !m.isRead).length;

  const rawHealth = healthRes.status === 'fulfilled' ? healthRes.value : null;
  const healthData = rawHealth?.data ?? rawHealth ?? null;

  return {
    counts: {
      projects: typeof projectsData.total === 'number' ? projectsData.total : projects.length,
      experience: typeof experienceData.total === 'number' ? experienceData.total : experience.length,
      education: typeof educationData.total === 'number' ? educationData.total : education.length,
      certifications: typeof certificationsData.total === 'number' ? certificationsData.total : certifications.length,
      socialLinks: typeof socialLinksData.total === 'number' ? socialLinksData.total : socialLinks.length,
      skills: typeof skillsData.total === 'number' ? skillsData.total : skills.length,
      messages: totalMessages,
      unreadMessages: unreadMessagesCount,
    },
    recentMessages: messages.slice(0, 5),
    systemHealth: healthData,
  };
};

// ==========================================
// PROJECTS CRUD API
// ==========================================

export const getAdminProjects = async (params = {}) => {
  const res = await api.get('/admin/projects', { params });
  return res.data;
};

export const getAdminProjectById = async (id) => {
  const res = await api.get(`/admin/projects/${id}`);
  return res.data;
};

export const createAdminProject = async (data) => {
  const res = await api.post('/admin/projects', data);
  return res.data;
};

export const updateAdminProject = async (id, data) => {
  const res = await api.put(`/admin/projects/${id}`, data);
  return res.data;
};

export const deleteAdminProject = async (id) => {
  const res = await api.delete(`/admin/projects/${id}`);
  return res.data;
};

// ==========================================
// EXPERIENCE CRUD API
// ==========================================

export const getAdminExperiences = async (params = {}) => {
  const res = await api.get('/admin/experience', { params });
  return res.data;
};

export const getAdminExperienceById = async (id) => {
  const res = await api.get(`/admin/experience/${id}`);
  return res.data;
};

export const createAdminExperience = async (data) => {
  const res = await api.post('/admin/experience', data);
  return res.data;
};

export const updateAdminExperience = async (id, data) => {
  const res = await api.put(`/admin/experience/${id}`, data);
  return res.data;
};

export const deleteAdminExperience = async (id) => {
  const res = await api.delete(`/admin/experience/${id}`);
  return res.data;
};

// ==========================================
// EDUCATION CRUD API
// ==========================================

export const getAdminEducations = async (params = {}) => {
  const res = await api.get('/admin/education', { params });
  return res.data;
};

export const getAdminEducationById = async (id) => {
  const res = await api.get(`/admin/education/${id}`);
  return res.data;
};

export const createAdminEducation = async (data) => {
  const res = await api.post('/admin/education', data);
  return res.data;
};

export const updateAdminEducation = async (id, data) => {
  const res = await api.put(`/admin/education/${id}`, data);
  return res.data;
};

export const deleteAdminEducation = async (id) => {
  const res = await api.delete(`/admin/education/${id}`);
  return res.data;
};

// ==========================================
// CERTIFICATIONS CRUD API
// ==========================================

export const getAdminCertifications = async (params = {}) => {
  const res = await api.get('/admin/certifications', { params });
  return res.data;
};

export const getAdminCertificationById = async (id) => {
  const res = await api.get(`/admin/certifications/${id}`);
  return res.data;
};

export const createAdminCertification = async (data) => {
  const res = await api.post('/admin/certifications', data);
  return res.data;
};

export const updateAdminCertification = async (id, data) => {
  const res = await api.put(`/admin/certifications/${id}`, data);
  return res.data;
};

export const deleteAdminCertification = async (id) => {
  const res = await api.delete(`/admin/certifications/${id}`);
  return res.data;
};

// ==========================================
// SOCIAL LINKS CRUD API
// ==========================================

export const getAdminSocialLinks = async (params = {}) => {
  const res = await api.get('/admin/social-links', { params });
  return res.data;
};

export const getAdminSocialLinkById = async (id) => {
  const res = await api.get(`/admin/social-links/${id}`);
  return res.data;
};

export const createAdminSocialLink = async (data) => {
  const res = await api.post('/admin/social-links', data);
  return res.data;
};

export const updateAdminSocialLink = async (id, data) => {
  const res = await api.put(`/admin/social-links/${id}`, data);
  return res.data;
};

export const deleteAdminSocialLink = async (id) => {
  const res = await api.delete(`/admin/social-links/${id}`);
  return res.data;
};

// ==========================================
// CONTACT MESSAGES API
// ==========================================

export const getAdminMessages = async (params = {}) => {
  const res = await api.get('/admin/messages', { params });
  return res.data;
};

export const getAdminMessageById = async (id) => {
  const res = await api.get(`/admin/messages/${id}`);
  return res.data;
};

export const markAdminMessageRead = async (id, isRead = true) => {
  const res = await api.patch(`/admin/messages/${id}/read`, { isRead });
  return res.data;
};

export const deleteAdminMessage = async (id) => {
  const res = await api.delete(`/admin/messages/${id}`);
  return res.data;
};

// ==========================================
// SKILLS CRUD API
// ==========================================

export const getAdminSkills = async (params = {}) => {
  const res = await api.get('/admin/skills', { params });
  return res.data;
};

export const getAdminSkillById = async (id) => {
  const res = await api.get(`/admin/skills/${id}`);
  return res.data;
};

export const createAdminSkill = async (data) => {
  const res = await api.post('/admin/skills', data);
  return res.data;
};

export const updateAdminSkill = async (id, data) => {
  const res = await api.put(`/admin/skills/${id}`, data);
  return res.data;
};

export const deleteAdminSkill = async (id) => {
  const res = await api.delete(`/admin/skills/${id}`);
  return res.data;
};



