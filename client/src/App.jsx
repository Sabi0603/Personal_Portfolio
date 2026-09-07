import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeProvider';
import { AuthProvider } from './context/AuthProvider';
import { SettingsProvider } from './context/SettingsProvider';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import SkillsPage from './pages/public/SkillsPage';
import ProjectsPage from './pages/public/ProjectsPage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import ExperiencePage from './pages/public/ExperiencePage';
import EducationPage from './pages/public/EducationPage';
import CertificationsPage from './pages/public/CertificationsPage';
import ContactPage from './pages/public/ContactPage';

// Admin Auth Pages
import AdminLoginPage from './pages/auth/AdminLoginPage';
import AdminForgotPasswordPage from './pages/auth/AdminForgotPasswordPage';
import AdminResetPasswordPage from './pages/auth/AdminResetPasswordPage';

// Admin Protected Pages (Steps 4-6)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminChangePasswordPage from './pages/admin/AdminChangePasswordPage';

// Admin Content CRUD Pages (Step 7)
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';
import AdminExperiencePage from './pages/admin/AdminExperiencePage';
import AdminEducationPage from './pages/admin/AdminEducationPage';
import AdminCertificationsPage from './pages/admin/AdminCertificationsPage';
import AdminSocialLinksPage from './pages/admin/AdminSocialLinksPage';

// Admin Messages Page (Step 8)
import AdminMessagesPage from './pages/admin/AdminMessagesPage';

// Fallback Page
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Portfolio Routes (Unchanged) */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="skills" element={<SkillsPage />} />
                <Route path="projects" element={<ProjectsPage />} />
                <Route path="projects/:slug" element={<ProjectDetailPage />} />
                <Route path="experience" element={<ExperiencePage />} />
                <Route path="education" element={<EducationPage />} />
                <Route path="certifications" element={<CertificationsPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Admin Authentication Routes (Publicly Accessible) */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
              <Route path="/admin/reset-password/:token" element={<AdminResetPasswordPage />} />

              {/* Admin Protected Command Center Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="skills" element={<AdminSkillsPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="experience" element={<AdminExperiencePage />} />
                <Route path="education" element={<AdminEducationPage />} />
                <Route path="certifications" element={<AdminCertificationsPage />} />
                <Route path="social-links" element={<AdminSocialLinksPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="change-password" element={<AdminChangePasswordPage />} />
              </Route>

              {/* 404 Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
