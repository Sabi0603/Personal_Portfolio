import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Route Imports
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import projectRoutes from './routes/project.routes.js';
import experienceRoutes from './routes/experience.routes.js';
import educationRoutes from './routes/education.routes.js';
import certificationRoutes from './routes/certification.routes.js';
import socialLinkRoutes from './routes/socialLink.routes.js';
import contactRoutes from './routes/contact.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import mediaRoutes from './routes/media.routes.js';
import adminRoutes from './routes/admin.routes.js';
import skillRoutes from './routes/skill.routes.js';
import Project from './models/Project.js';

import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;
const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = rawClientUrl
  .split(',')
  .map((u) => u.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Connect to Database
connectDB();

// Security & Utility Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (health checks, curl, mobile clients)
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(normalized) ||
        process.env.NODE_ENV === 'development' ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    name: 'Sabari M Portfolio API',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/health',
  });
});

// Dynamic XML Sitemap for public search engines
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = allowedOrigins[0] || 'https://sabari-portfolio.vercel.app';
    const staticPages = [
      '',
      'about',
      'skills',
      'projects',
      'experience',
      'education',
      'certifications',
      'contact',
    ];

    const projects = await Project.find({ isPublished: true }).select('slug updatedAt').lean();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const p of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/${p}</loc>\n`;
      xml += `    <changefreq>${p === '' ? 'daily' : p === 'projects' ? 'weekly' : 'monthly'}</changefreq>\n`;
      xml += `    <priority>${p === '' ? '1.0' : p === 'projects' ? '0.9' : '0.8'}</priority>\n`;
      xml += '  </url>\n';
    }

    for (const proj of projects) {
      if (proj.slug) {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/projects/${proj.slug}</loc>\n`;
        xml += `    <lastmod>${new Date(proj.updatedAt || Date.now()).toISOString().split('T')[0]}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.7</priority>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch {
    return res.status(500).send('Error generating sitemap');
  }
});

// Production robots.txt
app.get('/robots.txt', (req, res) => {
  const baseUrl = allowedOrigins[0] || 'https://sabari-portfolio.vercel.app';
  const robots = `# https://www.robotstxt.org/robotstxt.html\nUser-agent: *\nAllow: /\nDisallow: /api/admin\nDisallow: /api/admin/*\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Mount Public Routes
app.use('/api/health', healthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);

// Mount Admin Routes (Protected with JWT Auth Middleware)
app.use('/api/admin/media', mediaRoutes);
app.use('/api/admin', adminRoutes);

// Error Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

export default app;
