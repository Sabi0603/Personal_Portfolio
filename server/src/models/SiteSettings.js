import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default: 'Sabari M | MERN Stack Developer',
      trim: true,
      maxLength: 150,
    },
    siteDescription: {
      type: String,
      default: 'Production-ready full-stack portfolio of Sabari M, a MERN Stack Developer.',
      trim: true,
      maxLength: 300,
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    author: {
      type: String,
      default: 'Sabari M',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    enableContactForm: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    ogImage: {
      url: {
        type: String,
        default: '',
        trim: true,
      },
      publicId: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings =
  mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
